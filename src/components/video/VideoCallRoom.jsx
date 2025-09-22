import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, endCall, currentCall } = useSocket();
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isInitiator, setIsInitiator] = useState(false);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    // Determine if this user initiated the call
    const initiator = currentCall && currentCall.participants && 
                     currentCall.participants.patient && 
                     socket.id; // You might need to get this from user context
    setIsInitiator(!!initiator);

    initializeCall();
    setupSocketListeners();

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, [socket, roomId]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeCall = async () => {
    try {
      console.log('🎥 Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('🔗 Creating peer connection...');
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = peerConnection;

      // Add local stream tracks
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        console.log('➕ Added track:', track.kind);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📹 Received remote stream:', event.streams[0]);
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate');
          socket.emit('webrtc-signal', {
            roomId,
            type: 'ice-candidate',
            signal: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', peerConnection.connectionState);
        setIsConnected(peerConnection.connectionState === 'connected');
      };

      // Only the initiator creates the offer
      // Wait a bit for both peers to join the room
      setTimeout(async () => {
        if (isInitiator) {
          console.log('📤 Creating offer (as initiator)...');
          try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            socket.emit('webrtc-signal', {
              roomId,
              type: 'offer',
              signal: offer
            });
            console.log('📤 Offer sent');
          } catch (error) {
            console.error('❌ Error creating offer:', error);
          }
        } else {
          console.log('⏳ Waiting for offer (as receiver)...');
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Error initializing call:', error);
      alert('Could not access camera/microphone: ' + error.message);
    }
  };

  const setupSocketListeners = () => {
    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('call-ended', () => {
      cleanup();
      navigate('/dashboard');
    });

    return () => {
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('call-ended');
    };
  };

  const handleWebRTCSignal = async (data) => {
    const { type, signal, from } = data;
    const peerConnection = peerConnectionRef.current;

    console.log('📡 Received WebRTC signal:', type, 'from:', from);

    // Add null check
    if (!peerConnection) {
      console.error('❌ Peer connection not initialized');
      return;
    }

    try {
      switch (type) {
        case 'offer':
          console.log('📥 Handling offer...');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
          
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          socket.emit('webrtc-signal', {
            roomId,
            type: 'answer',
            signal: answer
          });
          console.log('📤 Answer sent');
          break;

        case 'answer':
          console.log('📥 Handling answer...');
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
          console.log('✅ Remote description set');
          break;

        case 'ice-candidate':
          console.log('📥 Adding ICE candidate...');
          await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
          break;

        default:
          console.warn('⚠️ Unknown signal type:', type);
      }
    } catch (error) {
      console.error('❌ WebRTC signal error:', error);
      // Don't alert for every error, just log it
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const handleEndCall = () => {
    cleanup();
    endCall();
    navigate('/dashboard');
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up...');
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      console.log('🔒 Peer connection closed');
    }

    // Clean up socket listeners
    if (socket) {
      socket.off('webrtc-signal');
      socket.off('call-ended');
    }
  };

  if (!currentCall) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Loading call...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">
            📞 Video Call {isConnected ? '- Connected' : '- Connecting...'}
          </h1>
          <div className="text-lg font-mono">
            {formatDuration(callDuration)}
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex">
        {/* Remote Video */}
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-gray-800"
          />
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
            {currentCall.participants?.doctor?.name || currentCall.participants?.patient?.name || 'Remote'}
          </div>
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p>Connecting to call...</p>
                <p className="text-sm mt-2">
                  {isInitiator ? 'Initiating connection...' : 'Waiting for connection...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Local Video */}
        <div className="w-1/4 relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover bg-gray-700 border-2 border-gray-600"
            style={{ transform: 'scaleX(-1)' }}
          />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center space-x-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full text-2xl ${
              isAudioOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? '🎤' : '🔇'}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full text-2xl ${
              isVideoOn ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? '📹' : '📵'}
          </button>
          
          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-2xl transition-colors"
            title="End call"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallRoom;