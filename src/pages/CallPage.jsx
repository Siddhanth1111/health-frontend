import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext'; // Just use the hook

// CallPage Component (no SocketProvider needed)
const CallPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { socket, isConnected, endCall } = useSocket();

  useEffect(() => {
    if (!isConnected) {
      console.log('❌ Not connected to socket server');
      return;
    }

    // Set up call-related socket listeners
    const handleIncomingCall = (data) => {
      console.log('📞 Incoming call:', data);
    };

    const handleCallResponse = (data) => {
      console.log('📞 Call response:', data);
    };

    socket?.on('incoming-call', handleIncomingCall);
    socket?.on('call-response', handleCallResponse);

    return () => {
      socket?.off('incoming-call', handleIncomingCall);
      socket?.off('call-response', handleCallResponse);
    };
  }, [socket, isConnected]);

  const handleEndCall = () => {
    endCall();
    navigate('/doctors');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Video Call</h1>
        <p className="mb-4">Doctor ID: {doctorId}</p>
        <div className="mb-8">
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
            isConnected ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-200' : 'bg-red-200'}`}></div>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
        
        {/* Video call interface would go here */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <div className="text-gray-400 text-6xl mb-4">📹</div>
          <p className="text-gray-300">Video call interface will be implemented here</p>
        </div>

        <button
          onClick={handleEndCall}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallPage;
