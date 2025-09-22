import React from 'react';
import { FaVideo, FaCircle } from 'react-icons/fa';
import { formatLastSeen } from '../../utils/helpers';

const UserCard = ({ user, onStartCall, socketConnected }) => {
  const handleCallClick = () => {
    console.log(`🎯 Call button clicked for ${user.name}`, {
      targetUser: user,
      socketConnected,
      userOnline: user.isOnline
    });

    onStartCall(user);
  };

  return (
    <div
      className={`rounded-lg p-5 border-2 transition-all duration-200 ${
        user.isOnline
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300 hover:shadow-lg'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          <img
            src={user.avatar}
            alt={user.name}
            className={`w-14 h-14 rounded-full border-3 ${
              user.isOnline ? 'border-green-300' : 'border-gray-300'
            }`}
          />
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
            user.isOnline ? 'bg-green-400' : 'bg-gray-400'
          }`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 truncate text-lg">{user.name}</h4>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {user.isOnline ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <FaCircle className="text-green-400 text-xs" />
                <span className="text-green-600 font-semibold">Online now</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              <div className="flex items-center space-x-1 mb-1">
                <FaCircle className="text-gray-400 text-xs" />
                <span>Offline</span>
              </div>
              <div className="text-xs">
                Last seen {formatLastSeen(user.lastSeen)}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={handleCallClick}
          disabled={!user.isOnline || !socketConnected}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform ${
            user.isOnline && socketConnected
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <FaVideo className="text-sm" />
          <span className="text-sm">
            {!socketConnected ? 'Offline' : !user.isOnline ? 'Unavailable' : 'Call'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default UserCard;
