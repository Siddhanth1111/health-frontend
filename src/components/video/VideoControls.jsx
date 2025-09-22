import React from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from "react-icons/fi";
import { FaTimes, FaExpand } from 'react-icons/fa';

const VideoControls = ({ 
  isAudioMuted, 
  isVideoMuted, 
  onToggleAudio, 
  onToggleVideo, 
  onEndCall,
  onFullscreen 
}) => {
  return (
    <div className='flex justify-center space-x-6 pb-8'>
      <button
        onClick={onToggleAudio}
        className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      >
        {isAudioMuted ? <FiMicOff className="text-white text-2xl" /> : <FiMic className="text-white text-2xl" />}
      </button>
      
      <button
        onClick={onToggleVideo}
        className={`p-4 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
        }`}
        title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
      >
        {isVideoMuted ? <FiVideoOff className="text-white text-2xl" /> : <FiVideo className="text-white text-2xl" />}
      </button>

      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className='p-4 rounded-full bg-gray-600 hover:bg-gray-700 shadow-lg transition-all transform hover:scale-110'
          title="Fullscreen"
        >
          <FaExpand className="text-white text-2xl" />
        </button>
      )}
      
      <button
        onClick={onEndCall}
        className='p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg transition-all transform hover:scale-110'
        title="End Call"
      >
        <FaTimes className="text-white text-2xl" />
      </button>
    </div>
  );
};

export default VideoControls;
