import React from 'react';
import { Outlet } from 'react-router-dom';
import { FaVideo } from 'react-icons/fa';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FaVideo className="text-blue-500 text-3xl" />
            <span className="text-2xl font-bold text-gray-800">VideoCall Pro</span>
          </div>
          <p className="text-gray-600">Professional video calling solution</p>
        </div>
        
        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
