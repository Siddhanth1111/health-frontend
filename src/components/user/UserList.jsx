import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from './UserCard';
import { FaExclamationTriangle } from 'react-icons/fa';

const UserList = ({ currentUser, users, socketConnected }) => {
  const navigate = useNavigate();

  const handleStartCall = (targetUser) => {
    if (!socketConnected) {
      alert('Connection lost! Please refresh the page to reconnect.');
      return;
    }

    if (!targetUser.isOnline) {
      alert(`${targetUser.name} is currently offline. Please try again when they're online.`);
      return;
    }

    navigate(`/call/${targetUser._id}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Current User Profile */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full border-4 border-green-400"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white bg-green-400"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentUser.name}</h2>
              <p className="text-gray-600">{currentUser.email}</p>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`text-sm font-medium ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {socketConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status Banner */}
      {!socketConnected && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Connection lost!</strong> Video calling is temporarily unavailable. 
                Please refresh the page to reconnect to the server.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Available Users */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Available Users</h3>
              <p className="text-gray-600 mt-1">Click on a user to start a video call</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                {users.filter(user => user.isOnline).length} of {users.length} users online
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <div className="text-gray-400 text-xl mb-2">No other users available</div>
              <p className="text-gray-500">Invite friends to join the platform!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  onStartCall={handleStartCall}
                  socketConnected={socketConnected}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Statistics Footer */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(user => user.isOnline).length}
            </div>
            <div className="text-sm text-gray-600">Online Now</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(user => !user.isOnline).length}
            </div>
            <div className="text-sm text-gray-600">Offline</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${socketConnected ? 'text-green-600' : 'text-red-600'}`}>
              {socketConnected ? '🟢' : '🔴'}
            </div>
            <div className="text-sm text-gray-600">Server Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
