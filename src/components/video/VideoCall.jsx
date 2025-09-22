import { useRef, useEffect, useState } from "react";
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { FaPhone, FaTimes, FaExclamationTriangle, FaUser, FaWifi } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { SOCKET_EVENTS, CALL_STATUS } from '../../utils/constants';
import { formatDuration, debugMediaStream } from '../../utils/helpers';

const configuration = {
  iceServers: [
    { urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"] },
  ],
  iceCandidatePoolSize: 10,
};

function VideoCall({ currentUser, targetUser, socket, onCallEnd }) {
  const pc = useRef(null);
  const localStream = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(CALL_STATUS.DISCONNECTED);
  const [callDuration, setCallDuration] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    hasLocalVideo: false,
    hasRemoteVideo: false,
    localStreamTracks: 0,
    remoteStreamTracks: 0,
    iceConnectionState: 'new',
    role: 'none'
  });

  const currentUserId = currentUser._id;
  const targetUserId = targetUser._id;

  useEffect(() => {
    if (!socket) {
      console.error('❌ Socket not provided to VideoCall component');
      return;
    }

    setSocketConnected(socket.connected);

    // Register current user for WebRTC calls
    const registerUser = () => {
      if (socket.connected && currentUser?._id && !isUserRegistered) {
        console.log('📝 Registering current user for WebRTC:', currentUser);
        socket.emit('register-user', {
          userId: currentUser._id,
          userType: currentUser.userType || 'patient',
          userName: currentUser.name
        });
      }
    };

    registerUser();

    // Socket event listeners
    socket.on('connect', () => {
      console.log('✅ Socket connected in VideoCall');
      setSocketConnected(true);
      registerUser();
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected in VideoCall');
      setSocketConnected(false);
      setIsUserRegistered(false);
      setConnectionStatus(CALL_STATUS.DISCONNECTED);
    });

    socket.on('user-registered', (data) => {
      console.log('✅ User registered in VideoCall:', data);
      setIsUserRegistered(true);
    });

    socket.on('registration-error', (error) => {
      console.error('❌ Registration error in VideoCall:', error);
      setIsUserRegistered(false);
    });

    socket.on(SOCKET_EVENTS.CALLING, handleSocketMessage);
    socket.on(SOCKET_EVENTS.INCOMING_CALL, handleIncomingCall);
    socket.on('call-response', handleCallResponse);
    
    socket.on('user-not-available', (data) => {
      console.log('❌ User not available:', data);
      Swal.fire('Error', `${targetUser.name} is not available`, 'error');
    });

    socket.on('call-failed', (data) => {
      console.log('❌ Call failed in VideoCall:', data);
      Swal.fire('Call Failed', data.reason || 'Unknown error', 'error');
      setIsCallActive(false);
      setConnectionStatus(CALL_STATUS.DISCONNECTED);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-registered');
      socket.off('registration-error');
      socket.off(SOCKET_EVENTS.CALLING);
      socket.off(SOCKET_EVENTS.INCOMING_CALL);
      socket.off('call-response');
      socket.off('user-not-available');
      socket.off('call-failed');
      cleanup();
    };
  }, [socket, currentUser, isUserRegistered]);

  // Call duration timer
  useEffect(() => {
    let interval;
    if (isCallActive && connectionStatus === CALL_STATUS.CONNECTED) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, connectionStatus]);

  // Enhanced media access
  const startLocalVideo = async () => {
    try {
      console.log("🎥 Requesting camera and microphone access...");
      
      if (localStream.current && localStream.current.getTracks().every(track => track.readyState === 'live')) {
        console.log("✅ Using existing local stream");
        if (localVideo.current) {
          localVideo.current.srcObject = localStream.current;
          try {
            await localVideo.current.play();
            console.log("✅ Local video reconnected and playing");
          } catch (playError) {
            console.warn("⚠️ Local video autoplay failed:", playError);
          }
          
          setDebugInfo(prev => ({
            ...prev,
            hasLocalVideo: true,
            localStreamTracks: localStream.current.getTracks().length
          }));
        }
        return true;
      }
      
      if (localStream.current) {
        console.log("⚠️ Stopping existing stream before creating new one");
        localStream.current.getTracks().forEach(track => track.stop());
        localStream.current = null;
      }

      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      localStream.current = await navigator.mediaDevices.getUserMedia(constraints);
      debugMediaStream(localStream.current, "Local");
      
      if (localVideo.current) {
        localVideo.current.srcObject = localStream.current;
        console.log("✅ Local video element srcObject set");
        
        try {
          await localVideo.current.play();
          console.log("✅ Local video started playing");
        } catch (playError) {
          console.warn("⚠️ Local video autoplay failed:", playError);
          localVideo.current.muted = true;
          await localVideo.current.play();
        }
      }
      
      setDebugInfo(prev => ({
        ...prev,
        hasLocalVideo: true,
        localStreamTracks: localStream.current.getTracks().length
      }));
      
      console.log("✅ Successfully accessed camera and microphone");
      return true;
    } catch (err) {
      console.error("❌ Error accessing media devices:", err);
      handlePermissionError(err);
      return false;
    }
  };

  const handlePermissionError = (error) => {
    let title = 'Permission Error';
    let message = '';

    switch (error.name) {
      case 'NotAllowedError':
        title = 'Camera & Microphone Access Denied';
        message = 'Please allow access to your camera and microphone to make video calls.';
        break;
      case 'NotFoundError':
        title = 'No Camera or Microphone Found';
        message = 'Please connect a camera and microphone to your device.';
        break;
      case 'NotReadableError':
        title = 'Device Already in Use';
        message = 'Your camera or microphone is being used by another application.';
        break;
      default:
        message = `Error: ${error.message || 'Unknown error occurred'}`;
    }

    Swal.fire({ title, text: message, icon: 'error' });
  };

  const handleSocketMessage = (message) => {
    console.log("📡 Received socket message:", message);
    
    switch (message.type) {
      case "offer":
        handleOffer(message);
        break;
      case "answer":
        handleAnswer(message);
        break;
      case "candidate":
        handleCandidate(message);
        break;
      case "bye":
        hangupCall();
        break;
      case "ready":
        if (!pc.current) {
          console.log("🚀 Ready to make call");
          setDebugInfo(prev => ({ ...prev, role: 'caller' }));
          makeCall();
        }
        break;
      default:
        console.log("❓ Unhandled message type:", message.type);
        break;
    }
  };

  const handleIncomingCall = (data) => {
    console.log("📞 Incoming call from:", data.fromUserId);
    setDebugInfo(prev => ({ ...prev, role: 'callee' }));
    
    Swal.fire({
      title: `Incoming call from ${data.fromUserName}`,
      html: `
        <div class="flex items-center justify-center mb-4">
          <img src="${data.fromUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fromUserName)}&background=4f46e5&color=fff&size=80`}" 
               alt="${data.fromUserName}" 
               class="w-20 h-20 rounded-full border-4 border-blue-200" />
        </div>
        <p class="text-gray-600 mb-2">Do you want to accept this video call?</p>
      `,
      showCancelButton: true,
      confirmButtonText: '📹 Accept',
      cancelButtonText: '❌ Decline',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      allowOutsideClick: false,
      timer: 30000,
      timerProgressBar: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        const mediaStarted = await startLocalVideo();
        if (mediaStarted) {
          acceptCall(data.fromUserId);
        }
      } else {
        rejectCall(data.fromUserId);
      }
    });
  };

  const handleCallResponse = (data) => {
    if (data.accepted) {
      console.log("✅ Call accepted");
    } else {
      Swal.fire('Call Declined', `${targetUser.name} declined your call`, 'info');
    }
  };

  const initiateCall = async () => {
    console.log(`🚀 Initiating call to ${targetUser.name}...`);
    
    if (!socket || !socket.connected) {
      Swal.fire('Connection Error', 'Socket not connected. Please refresh the page.', 'error');
      return;
    }

    // Ensure user is registered before making call
    if (!isUserRegistered) {
      console.log('📝 Ensuring user is registered before call...');
      socket.emit('register-user', {
        userId: currentUser._id,
        userType: currentUser.userType || 'patient',
        userName: currentUser.name
      });
      
      // Wait for registration to complete
      await new Promise(resolve => {
        const checkRegistration = () => {
          if (isUserRegistered) {
            resolve();
          } else {
            setTimeout(checkRegistration, 100);
          }
        };
        checkRegistration();
      });
    }

    const mediaStarted = await startLocalVideo();
    if (!mediaStarted) return;

    setIsCallActive(true);
    setConnectionStatus(CALL_STATUS.CONNECTING);
    setCallDuration(0);
    setDebugInfo(prev => ({ ...prev, role: 'caller' }));
    
    // Show calling dialog
    Swal.fire({
      title: `Calling ${targetUser.name}...`,
      html: `
        <div class="flex items-center justify-center mb-4">
          <img src="${targetUser.avatar}" 
               alt="${targetUser.name}" 
               class="w-20 h-20 rounded-full border-4 border-blue-200" />
        </div>
        <p class="text-gray-600">Waiting for ${targetUser.name} to answer...</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Cancel Call',
      allowOutsideClick: false,
      timer: 45000,
      timerProgressBar: true
    }).then((result) => {
      if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
        hangupCall();
      }
    });
    
    // Use the initiate-call event for backend integration
    console.log('📞 Emitting initiate call event...');
    console.log('👤 Current user ID:', currentUser._id);
    console.log('🎯 Target user ID:', targetUser._id);
    
    socket.emit('initiate-call', {
      targetUserId: targetUser._id,
      fromUserId: currentUser._id,
      fromUserName: currentUser.name,
      fromUserType: currentUser.userType || 'patient'
    });
  };

  const acceptCall = async (fromUserId) => {
    console.log("📞 Accepting call from:", fromUserId);
    
    if (!localStream.current) {
      const mediaStarted = await startLocalVideo();
      if (!mediaStarted) return;
    }

    if (localVideo.current && localStream.current) {
      localVideo.current.srcObject = localStream.current;
      await localVideo.current.play().catch(console.warn);
    }

    setIsCallActive(true);
    setConnectionStatus(CALL_STATUS.CONNECTING);
    setCallDuration(0);
    
    socket.emit('call-response', {
      targetUserId: fromUserId,
      accepted: true
    });

    socket.emit(SOCKET_EVENTS.CALLING, {
      targetUserId: fromUserId,
      type: 'ready'
    });

    Swal.close();
  };

  const rejectCall = (fromUserId) => {
    socket.emit('call-response', {
      targetUserId: fromUserId,
      accepted: false
    });
  };

  const makeCall = async () => {
    if (!localStream.current) {
      const mediaStarted = await startLocalVideo();
      if (!mediaStarted) return;
    }

    try {
      console.log("🔗 Creating peer connection...");
      pc.current = new RTCPeerConnection(configuration);
      
      pc.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(SOCKET_EVENTS.CALLING, {
            targetUserId: targetUserId,
            type: "candidate",
            candidate: e.candidate.candidate,
            sdpMid: e.candidate.sdpMid,
            sdpMLineIndex: e.candidate.sdpMLineIndex,
          });
        }
      };

      pc.current.ontrack = (e) => {
        console.log("🎬 Received remote track:", e);
        if (remoteVideo.current && e.streams[0]) {
          remoteVideo.current.srcObject = e.streams[0];
          debugMediaStream(e.streams[0], "Remote");
          
          setDebugInfo(prev => ({
            ...prev,
            hasRemoteVideo: true,
            remoteStreamTracks: e.streams[0].getTracks().length
          }));

          remoteVideo.current.play().catch(err => {
            console.warn("Remote video play failed:", err);
            remoteVideo.current.muted = true;
            remoteVideo.current.play().catch(console.error);
          });
          
          Swal.close();
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        const state = pc.current.iceConnectionState;
        setDebugInfo(prev => ({ ...prev, iceConnectionState: state }));
        
        if (state === 'connected') {
          setConnectionStatus(CALL_STATUS.CONNECTED);
          Swal.close();
        } else if (state === 'disconnected' || state === 'failed') {
          setConnectionStatus(CALL_STATUS.DISCONNECTED);
        }
      };

      localStream.current.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream.current);
      });

      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.current.setLocalDescription(offer);
      
      socket.emit(SOCKET_EVENTS.CALLING, {
        targetUserId: targetUserId,
        type: "offer",
        sdp: offer.sdp
      });
      
    } catch (e) {
      console.error("❌ Error making call:", e);
    }
  };

  const handleOffer = async (offer) => {
    if (pc.current) {
      console.warn("⚠️ Peer connection already exists");
      return;
    }

    if (!localStream.current) {
      const mediaStarted = await startLocalVideo();
      if (!mediaStarted) return;
    }

    try {
      console.log("📥 Handling offer from:", offer.fromUserId);
      pc.current = new RTCPeerConnection(configuration);
      
      pc.current.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(SOCKET_EVENTS.CALLING, {
            targetUserId: offer.fromUserId,
            type: "candidate",
            candidate: e.candidate.candidate,
            sdpMid: e.candidate.sdpMid,
            sdpMLineIndex: e.candidate.sdpMLineIndex,
          });
        }
      };

      pc.current.ontrack = (e) => {
        if (remoteVideo.current && e.streams[0]) {
          remoteVideo.current.srcObject = e.streams[0];
          setDebugInfo(prev => ({
            ...prev,
            hasRemoteVideo: true,
            remoteStreamTracks: e.streams[0].getTracks().length
          }));
          remoteVideo.current.play().catch(console.warn);
        }
      };

      pc.current.oniceconnectionstatechange = () => {
        const state = pc.current.iceConnectionState;
        setDebugInfo(prev => ({ ...prev, iceConnectionState: state }));
        if (state === 'connected') {
          setConnectionStatus(CALL_STATUS.CONNECTED);
        }
      };

      localStream.current.getTracks().forEach((track) => {
        pc.current.addTrack(track, localStream.current);
      });

      await pc.current.setRemoteDescription(new RTCSessionDescription({
        type: 'offer',
        sdp: offer.sdp
      }));

      const answer = await pc.current.createAnswer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await pc.current.setLocalDescription(answer);
      
      socket.emit(SOCKET_EVENTS.CALLING, {
        targetUserId: offer.fromUserId,
        type: "answer",
        sdp: answer.sdp
      });
      
    } catch (e) {
      console.error("❌ Error handling offer:", e);
    }
  };

  const handleAnswer = async (answer) => {
    if (!pc.current) {
      console.error("❌ No peer connection found for answer");
      return;
    }

    try {
      await pc.current.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: answer.sdp
      }));
    } catch (e) {
      console.error("❌ Error handling answer:", e);
    }
  };

  const handleCandidate = async (candidateData) => {
    if (!pc.current) {
      console.error("❌ No peer connection found for candidate");
      return;
    }

    try {
      const candidate = new RTCIceCandidate({
        candidate: candidateData.candidate,
        sdpMid: candidateData.sdpMid,
        sdpMLineIndex: candidateData.sdpMLineIndex,
      });
      
      await pc.current.addIceCandidate(candidate);
    } catch (e) {
      console.error("❌ Error handling candidate:", e);
    }
  };

  const hangupCall = () => {
    cleanup();
    setIsCallActive(false);
    setConnectionStatus(CALL_STATUS.DISCONNECTED);
    setCallDuration(0);
    Swal.close();
    if (onCallEnd) onCallEnd();
  };

  const endCall = () => {
    Swal.fire({
      title: 'End Call?',
      text: `Are you sure you want to end the call with ${targetUser.name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'End Call',
      cancelButtonText: 'Continue',
      confirmButtonColor: '#ef4444',
    }).then((result) => {
      if (result.isConfirmed) {
        socket.emit(SOCKET_EVENTS.CALLING, {
          targetUserId: targetUserId,
          type: "bye"
        });
        hangupCall();
      }
    });
  };

  const cleanup = () => {
    if (pc.current) {
      pc.current.close();
      pc.current = null;
    }
    
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (localVideo.current) {
      localVideo.current.srcObject = null;
    }
    
    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }

    setDebugInfo({
      hasLocalVideo: false,
      hasRemoteVideo: false,
      localStreamTracks: 0,
      remoteStreamTracks: 0,
      iceConnectionState: 'new',
      role: 'none'
    });
  };

  const toggleAudio = () => {
    if (localStream.current) {
      localStream.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream.current) {
      localStream.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoMuted(!isVideoMuted);
    }
  };

  if (!isCallActive) {
    return (
      <div className="flex flex-col items-center space-y-6 p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 rounded-full border-4 border-blue-100"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white ${
                  socketConnected && isUserRegistered ? 'bg-green-400' : 'bg-red-400'
                }`}>
                  {socketConnected && isUserRegistered ? (
                    <FaWifi className="text-white text-xs mt-1 ml-1" />
                  ) : (
                    <FaExclamationTriangle className="text-white text-xs mt-1 ml-1" />
                  )}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-400">→</div>
              <img
                src={targetUser.avatar}
                alt={targetUser.name}
                className="w-20 h-20 rounded-full border-4 border-green-100"
              />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ready to call {targetUser.name}
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              Video call will start once you both are ready
            </p>
            {!isUserRegistered && (
              <p className="text-red-500 text-sm">Registering user...</p>
            )}
          </div>
          
          <button
            onClick={initiateCall}
            disabled={!socketConnected || !isUserRegistered}
            className={`w-full px-6 py-4 rounded-xl font-semibold text-lg transform transition-all duration-200 flex items-center justify-center space-x-3 ${
              socketConnected && isUserRegistered
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiVideo className="text-xl" />
            <span>
              {socketConnected && isUserRegistered 
                ? `Call ${targetUser.name}` 
                : 'Connection Required'
              }
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-br from-gray-900 to-black w-screen h-screen fixed top-0 left-0 z-50 flex flex-col'>
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full border-2 border-blue-400" />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                socketConnected && isUserRegistered ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
            </div>
            <div>
              <div className="font-semibold">{currentUser.name}</div>
              <div className="text-xs text-gray-300">You ({debugInfo.role})</div>
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-mono">
              {connectionStatus === CALL_STATUS.CONNECTED ? formatDuration(callDuration) : connectionStatus}
            </div>
            <div className="text-xs text-gray-300">ICE: {debugInfo.iceConnectionState}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="font-semibold">{targetUser.name}</div>
              <div className="text-xs text-gray-300">Remote</div>
            </div>
            <img src={targetUser.avatar} alt={targetUser.name} className="w-12 h-12 rounded-full border-2 border-green-400" />
          </div>
        </div>
      </div>

      {/* Video containers */}
      <div className='flex-1 flex justify-center items-center space-x-6 p-6'>
        <div className='relative'>
          <div className='bg-gray-800 h-80 w-64 md:h-96 md:w-72 lg:h-[480px] lg:w-96 rounded-2xl shadow-2xl overflow-hidden border-4 border-blue-500'>
            <video 
              ref={localVideo} 
              className='w-full h-full object-cover' 
              autoPlay 
              playsInline 
              muted
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className='absolute bottom-4 left-4 right-4'>
              <div className='bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg backdrop-blur-sm'>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-sm">{currentUser.name}</span>
                  </div>
                  <div className="text-xs text-gray-300">{debugInfo.localStreamTracks} tracks</div>
                </div>
              </div>
            </div>
            {!debugInfo.hasLocalVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-90">
                <div className="text-center">
                  <FaUser className="text-4xl text-gray-400 mb-4 mx-auto" />
                  <span className="text-white block mb-3">No Local Video</span>
                  <button 
                    onClick={startLocalVideo}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Restart Video
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className='relative'>
          <div className='bg-gray-800 h-80 w-64 md:h-96 md:w-72 lg:h-[480px] lg:w-96 rounded-2xl shadow-2xl overflow-hidden border-4 border-green-500'>
            <video 
              ref={remoteVideo} 
              className='w-full h-full object-cover' 
              autoPlay 
              playsInline
            />
            <div className='absolute bottom-4 left-4 right-4'>
              <div className='bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg backdrop-blur-sm'>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={targetUser.avatar} alt={targetUser.name} className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-sm">{targetUser.name}</span>
                  </div>
                  <div className="text-xs text-gray-300">{debugInfo.remoteStreamTracks} tracks</div>
                </div>
              </div>
            </div>
            {!debugInfo.hasRemoteVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-90">
                <div className="text-center">
                  <FaUser className="text-4xl text-gray-400 mb-4 mx-auto" />
                  <span className="text-white block mb-2">Connecting to {targetUser.name}...</span>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mt-3"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className='flex justify-center space-x-6 pb-8'>
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
            isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isAudioMuted ? <FiMicOff className="text-white text-2xl" /> : <FiMic className="text-white text-2xl" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
            isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isVideoMuted ? <FiVideoOff className="text-white text-2xl" /> : <FiVideo className="text-white text-2xl" />}
        </button>
        
        <button
          onClick={endCall}
          className='p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all transform hover:scale-110'
        >
          <FaTimes className="text-white text-2xl" />
        </button>
      </div>
    </div>
  );
}

export default VideoCall;
