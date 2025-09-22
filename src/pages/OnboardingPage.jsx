import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const OnboardingPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleRoleSelection = async (role) => {
    if (!user) return;
    
    setIsLoading(true);
    setSelectedRole(role);
    
    try {
      // Store user type in localStorage as a fallback
      localStorage.setItem('userType', role);
      localStorage.setItem(`userType_${user.id}`, role);
      
      console.log('✅ User role stored locally:', role);
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to dashboard after role selection
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error storing user role:', error);
      alert('Failed to set user role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600">
            Please select your role to get started
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelection('patient')}
            disabled={isLoading}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedRole === 'patient' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🏥</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">I'm a Patient</h3>
                <p className="text-gray-600 text-sm">
                  I want to book appointments and consult with doctors
                </p>
              </div>
            </div>
            {selectedRole === 'patient' && isLoading && (
              <div className="mt-3 flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Setting up...</span>
              </div>
            )}
          </button>

          <button
            onClick={() => handleRoleSelection('doctor')}
            disabled={isLoading}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-200 ${
              selectedRole === 'doctor' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">I'm a Doctor</h3>
                <p className="text-gray-600 text-sm">
                  I want to provide consultations and manage appointments
                </p>
              </div>
            </div>
            {selectedRole === 'doctor' && isLoading && (
              <div className="mt-3 flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm">Setting up...</span>
              </div>
            )}
          </button>
        </div>

        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span>Setting up your account as {selectedRole}...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
