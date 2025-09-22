import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import ApiService from '../services/api';
import Loading from '../components/common/Loading';

const ConsultationsPage = () => {
  const [consultations, setConsultations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  const { getToken } = useAuth();

  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Load profile to determine user type
      const profileData = await ApiService.getCurrentUser(token);
      setProfile(profileData);
      
      // Load consultations
      const consultationsData = await ApiService.getConsultations(token);
      setConsultations(consultationsData);
    } catch (error) {
      console.error('❌ Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    if (filter === 'all') return true;
    return consultation.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Loading message="Loading consultations..." />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {profile?.userType === 'patient' ? 'My Consultations' : 'My Appointments'}
        </h1>
        <p className="text-gray-600">
          {profile?.userType === 'patient' 
            ? 'View your medical consultation history'
            : 'Manage your patient appointments'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({consultations.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'scheduled' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Scheduled ({consultations.filter(c => c.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({consultations.filter(c => c.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cancelled' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled ({consultations.filter(c => c.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Consultations List */}
      {filteredConsultations.length > 0 ? (
        <div className="space-y-4">
          {filteredConsultations.map((consultation) => (
            <div key={consultation._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <img
                    src={profile?.userType === 'patient' 
                      ? consultation.doctor.avatar 
                      : consultation.patient.avatar
                    }
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-gray-200"
                  />
                  
                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {profile?.userType === 'patient' 
                          ? `Dr. ${consultation.doctor.name}`
                          : consultation.patient.name
                        }
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>📅</span>
                          <span>{formatDate(consultation.scheduledAt)}</span>
                        </div>
                        {profile?.userType === 'patient' && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span>🏥</span>
                            <span>{consultation.doctor.specialty}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>💰</span>
                          <span>${consultation.fee}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span>🎥</span>
                          <span className="capitalize">{consultation.type} Call</span>
                        </div>
                      </div>
                    </div>

                    {consultation.symptoms && consultation.symptoms.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Symptoms:</div>
                        <div className="flex flex-wrap gap-1">
                          {consultation.symptoms.map((symptom, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {consultation.diagnosis && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Diagnosis:</div>
                        <p className="text-sm text-gray-700">{consultation.diagnosis}</p>
                      </div>
                    )}

                    {consultation.notes && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 mb-1">Notes:</div>
                        <p className="text-sm text-gray-700">{consultation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {consultation.status === 'scheduled' && (
                    <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                      Join Call
                    </button>
                  )}
                  
                  {consultation.status === 'completed' && profile?.userType === 'patient' && !consultation.rating && (
                    <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
                      Rate Doctor
                    </button>
                  )}
                  
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                    View Details
                  </button>
                </div>
              </div>

              {/* Prescription */}
              {consultation.prescription && consultation.prescription.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-2">Prescription:</div>
                  <div className="space-y-2">
                    {consultation.prescription.map((med, index) => (
                      <div key={index} className="bg-blue-50 p-3 rounded text-sm">
                        <div className="font-medium">{med.medication}</div>
                        <div className="text-gray-600">
                          {med.dosage} - {med.frequency} for {med.duration}
                        </div>
                        {med.instructions && (
                          <div className="text-gray-500 text-xs mt-1">{med.instructions}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No consultations found</h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? (profile?.userType === 'patient' 
                 ? "You haven't had any consultations yet." 
                 : "You don't have any appointments yet.")
              : `No ${filter} consultations found.`}
          </p>
          {profile?.userType === 'patient' && filter === 'all' && (
            <button
              onClick={() => window.location.href = '/doctors'}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Browse Doctors
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ConsultationsPage;
