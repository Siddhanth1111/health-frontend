import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const VideoCallRoom = ({ currentCall }) => {
  const { roomId } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);

  // Track local/remote streams
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Setup ICE servers
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
    ],
  };

  const isCaller = currentCall?.role === 'patient'; // Example role check

  const initializeCall = async () => {
    console.log('📞 Initializing call...');

    peerConnectionRef.current = new RTCPeerConnection(iceServers);

    // Remote stream
    remoteStreamRef.current = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }

    // On remote track
    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        remoteStreamRef.current.addTrack(track);
      });
    };

    // ICE candidate handling
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          roomId,
          type: 'ice-candidate',
          signal: event.candidate,
        });
      }
    };

    // Get user media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });
    } catch (err) {
      console.error('❌ Error accessing media devices:', err);
    }

    // Caller creates offer
    if (isCaller) {
      try {
        const offer = await peerConnectionRef.current.createOffer();
        await peerConnectionRef.current.setLocalDescription(offer);
        socket.emit('webrtc-signal', {
          roomId,
          type: 'offer',
          signal: offer,
        });
      } catch (err) {
        console.error('❌ Error creating offer:', err);
      }
    }
  };

  const handleWebRTCSignal = async ({ type, signal }) => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection) {
      console.warn('⚠️ No peer connection yet');
      return;
    }

    switch (type) {
      case 'offer':
        if (!isCaller) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('webrtc-signal', { roomId, type: 'answer', signal: answer });
        }
        break;

      case 'answer':
        if (isCaller) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
        }
        break;

      case 'ice-candidate':
        if (peerConnection.signalingState === 'closed') {
          console.warn('⚠️ Ignoring ICE candidate: connection closed');
          return;
        }
        if (peerConnection.remoteDescription && peerConnection.remoteDescription.type) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(signal));
            console.log('✅ ICE candidate added');
          } catch (err) {
            console.error('❌ Error adding ICE candidate:', err);
          }
        } else {
          console.log('⏳ Remote description not set yet, ignoring candidate');
        }
        break;

      default:
        console.warn('⚠️ Unknown WebRTC signal type:', type);
    }
  };

  const cleanup = () => {
    console.log('🧹 Cleaning up call...');

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => track.stop());
      remoteStreamRef.current = null;
    }
  };

  useEffect(() => {
    if (!socket || !roomId) return;

    initializeCall();
    socket.on('webrtc-signal', handleWebRTCSignal);
    socket.on('call-ended', () => {
      cleanup();
      navigate('/dashboard');
    });

    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      cleanup();
      socket.off('webrtc-signal', handleWebRTCSignal);
      socket.off('call-ended');
    };
  }, [socket, roomId]);

  return (
    <div className="video-call-container">
      <div className="videos">
        <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
        <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
      </div>
      <div className="call-info">
        <p>Call Duration: {Math.floor(callDuration / 60)}:{callDuration % 60}</p>
        <button onClick={() => {
          socket.emit('end-call', { roomId });
          cleanup();
          navigate('/dashboard');
        }}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
