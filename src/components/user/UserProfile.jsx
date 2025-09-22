import React from 'react';
import { FaCircle, FaWifi } from 'react-icons/fa';

const UserProfile = ({ user, isCurrentUser = false, socketConnected = false }) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <img
          src={user.avatar}
          alt={user.name}
          className={`w-16 h-16 rounded-full border-4 ${
            isCurrentUser ? 'border-green-400' : 'border-blue-100'
          }`}
        />
        {isCurrentUser && (
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${
            socketConnected ? 'bg-green-400' : 'bg-red-400'
          }`}>
            <FaWifi className={`text-white text-xs ${socketConnected ? '' : 'opacity-50'}`} />
          </div>
        )}
        {!isCurrentUser && user.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white bg-green-400"></div>
        )}
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
        <div className="flex items-center space-x-4 mt-1">
          <div className="flex items-center space-x-2">
            <FaCircle className={`text-xs ${user.isOnline ? 'text-green-400' : 'text-gray-400'}`} />
            <span className={`text-sm font-medium ${user.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
              {user.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          {isCurrentUser && (
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className={`text-sm font-medium ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
