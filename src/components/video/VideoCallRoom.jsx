import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

const VideoCallRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, endCall, currentCall, userType } = useSocket();

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerConnectionRef = useRef();
  const localStreamRef = useRef();
  const pendingCandidates = useRef([]);

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

    setIsInitiator(userType === 'patient'); // ✅ only once

    initCall();
    setupSocket();

    const timer = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => {
      clearInterval(timer);
      cleanup();
    };
  }, [socket, roomId]);

  const initCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('webrtc-signal', {
            roomId,
            type: 'ice-candidate',
            signal: event.candidate
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setIsConnected(pc.connectionState === 'connected');
      };

      if (userType === 'patient') {
        // Patient always initiates
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-signal', { roomId, type: 'offer', signal: offer });
      }

    } catch (err) {
      alert('Could not access camera/microphone: ' + err.message);
    }
  };

  const setupSocket = () => {
    socket.on('webrtc-signal', handleSignal);
    socket.on('call-ended', () => {
      cleanup();
      navigate('/dashboard');
    });
  };

  const handleSignal = async ({ type, signal }) => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    try {
      if (type === 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-signal', { roomId, type: 'answer', signal: answer });

        // flush queued ICE
        while (pendingCandidates.current.length) {
          const c = pendingCandidates.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
      }

      if (type === 'answer') {
        await pc.setRemoteDescription(new RTCSessionDescription(signal));
        while (pendingCandidates.current.length) {
          const c = pendingCandidates.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
      }

      if (type === 'ice-candidate') {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(signal));
        } else {
          pendingCandidates.current.push(signal);
        }
      }
    } catch (err) {
      console.error('❌ Signal handling error:', err);
    }
  };

  const toggleVideo = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOn(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsAudioOn(track.enabled);
    }
  };

  const handleEndCall = () => {
    cleanup();
    endCall();
    navigate('/dashboard');
  };

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    socket?.off('webrtc-signal');
    socket?.off('call-ended');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex justify-between">
        <h1>📞 Video Call {isConnected ? '- Connected' : '- Connecting...'}</h1>
        <span>{String(Math.floor(callDuration / 60)).padStart(2, '0')}:{String(callDuration % 60).padStart(2, '0')}</span>
      </div>

      {/* Videos */}
      <div className="flex-1 flex">
        <video ref={remoteVideoRef} autoPlay playsInline className="flex-1 bg-black" />
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/4 bg-gray-700" style={{ transform: 'scaleX(-1)' }} />
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center space-x-4">
        <button onClick={toggleAudio}>{isAudioOn ? 'Mute' : 'Unmute'}</button>
        <button onClick={toggleVideo}>{isVideoOn ? 'Camera Off' : 'Camera On'}</button>
        <button onClick={handleEndCall} className="bg-red-600 px-4 py-2">End</button>
      </div>
    </div>
  );
};

export default VideoCallRoom;
