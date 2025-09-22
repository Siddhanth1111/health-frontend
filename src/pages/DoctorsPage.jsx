import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

const DoctorsPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { initiateCall, isConnected, onlineDoctors } = useSocket();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the deployed backend URL
      const backendUrl = import.meta.env.VITE_SOCKET_URL || 'https://health-app-backend-xuv7.onrender.com';
      const apiUrl = `${backendUrl}/api/doctors`;
      
      console.log('🔍 Fetching doctors from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const doctorsData = await response.json();
      console.log('👨‍⚕️ Doctors loaded:', doctorsData);
      
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error) {
      console.error('❌ Error loading doctors:', error);
      setError(`Failed to load doctors: ${error.message}`);
      
      // Fallback: Create some dummy doctors for testing
      const dummyDoctors = [
        {
          _id: 'dummy1',
          name: 'Dr. John Smith',
          specialty: 'General Physician',
          experience: 10,
          consultationFee: 100,
          isVerified: true
        },
        {
          _id: 'dummy2',
          name: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          experience: 8,
          consultationFee: 150,
          isVerified: true
        },
        {
          _id: 'dummy3',
          name: 'Dr. Michael Brown',
          specialty: 'Pediatrician',
          experience: 12,
          consultationFee: 120,
          isVerified: true
        }
      ];
      setDoctors(dummyDoctors);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCall = (doctor) => {
    if (!isConnected) {
      alert('Not connected to server. Please refresh and try again.');
      return;
    }
    
    console.log('📞 Starting call with doctor:', doctor._id, doctor.name);
    initiateCall(doctor._id, doctor.name);
  };

  const handleRetry = () => {
    loadDoctors();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Doctors</h1>
              <p className="text-gray-600">Find and connect with verified medical professionals</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Connection Warning
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{error}</p>
                  <p className="mt-1">Showing sample doctors for testing. The video calling will still work!</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleRetry}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {doctor.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                  <div className="flex items-center mt-1">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      onlineDoctors.has(doctor._id) ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-sm text-gray-500">
                      {onlineDoctors.has(doctor._id) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{doctor.experience} years</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Consultation Fee:</span>
                  <span className="font-medium">${doctor.consultationFee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    doctor.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doctor.isVerified ? '✅ Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleVideoCall(doctor)}
                  disabled={!isConnected}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isConnected
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  📹 Video Call
                </button>
                <button className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  📅 Book Later
                </button>
              </div>
            </div>
          ))}
        </div>

        {doctors.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No doctors available</h3>
            <p className="text-gray-500 mb-4">Please try again later or contact support.</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
