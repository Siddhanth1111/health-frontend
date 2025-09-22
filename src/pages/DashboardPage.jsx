import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const DashboardPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { isConnected, isRegistered, userType } = useSocket();

  // If no userType, redirect to onboarding
  if (!userType) {
    navigate('/onboarding');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard
              </h1>
              <div className="ml-4 flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected && isRegistered ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-gray-500">
                  {isConnected && isRegistered ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">{user?.fullName}</div>
                <div className="text-sm text-gray-500 capitalize">
                  {userType} • {user?.emailAddresses?.[0]?.emailAddress}
                </div>
              </div>
              <img
                src={user?.imageUrl}
                alt={user?.fullName}
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Welcome back, {user?.firstName}! 👋
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              You are registered as a <strong className="capitalize">{userType}</strong>. 
              {userType === 'patient' 
                ? ' You can book appointments and consult with doctors.' 
                : ' You can manage appointments and provide consultations.'
              }
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userType === 'patient' && (
            <>
              <div 
                onClick={() => navigate('/doctors')}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Find Doctors</h3>
                    <p className="text-sm text-gray-500">Browse and connect with doctors</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">My Appointments</h3>
                    <p className="text-sm text-gray-500">View scheduled consultations</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {userType === 'doctor' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Patient Queue</h3>
                    <p className="text-sm text-gray-500">Manage incoming consultations</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
                    <p className="text-sm text-gray-500">Update availability and info</p>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">View consultation history</p>
              </div>
            </div>
          </div>

          {/* Reset Role Button (for testing) */}
          <div 
            onClick={() => {
              localStorage.removeItem('userType');
              localStorage.removeItem(`userType_${user?.id}`);
              navigate('/onboarding');
            }}
            className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-700">Reset Role</h3>
                <p className="text-sm text-gray-500">Change your user type</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connection Status</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  Server Connection: <strong>{isConnected ? 'Connected' : 'Disconnected'}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isRegistered ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  Registration: <strong>{isRegistered ? 'Registered' : 'Not Registered'}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm">
                  User Type: <strong className="capitalize">{userType}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
