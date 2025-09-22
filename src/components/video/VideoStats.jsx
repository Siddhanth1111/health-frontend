import React from 'react';
import { formatDuration } from '../../utils/helpers';

const VideoStats = ({ 
  connectionStatus, 
  callDuration, 
  debugInfo, 
  socketConnected 
}) => {
  return (
    <div className="bg-black bg-opacity-50 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="text-center">
          <div className="text-xl font-mono">
            {connectionStatus === 'connected' ? formatDuration(callDuration) : connectionStatus}
          </div>
          <div className="text-xs text-gray-300 flex items-center justify-center space-x-2">
            <span>ICE: {debugInfo.iceConnectionState}</span>
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
        </div>
        
        <div className="text-right text-xs text-gray-300">
          <div>Local: {debugInfo.hasLocalVideo ? '✅' : '❌'} ({debugInfo.localStreamTracks} tracks)</div>
          <div>Remote: {debugInfo.hasRemoteVideo ? '✅' : '❌'} ({debugInfo.remoteStreamTracks} tracks)</div>
        </div>
      </div>
    </div>
  );
};

export default VideoStats;
