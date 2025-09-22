import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUsers } from '../../hooks/useUsers';
import Loading from '../common/Loading';

const ProfileSelector = ({ redirectTo }) => {
  const { login, loading: authLoading } = useAuth();
  const { users, loading: usersLoading, error } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    try {
      await login(user);
      // Navigation is handled in AuthContext
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  if (usersLoading) {
    return <Loading message="Loading profiles..." />;
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <button
          key={user._id}
          onClick={() => handleUserSelect(user)}
          disabled={authLoading && selectedUser?._id === user._id}
          className={`w-full flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
            selectedUser?._id === user._id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          } ${authLoading && selectedUser?._id === user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="text-left flex-1">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          {authLoading && selectedUser?._id === user._id && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProfileSelector;
