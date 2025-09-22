import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import ApiService from '../services/api';
import { DOCTOR_SPECIALTIES } from '../utils/constants';
import Loading from '../components/common/Loading';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const profileData = await ApiService.getCurrentUser(token);
      setProfile(profileData);
      setFormData(profileData);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      
      let updatedProfile;
      if (profile.userType === 'patient') {
        updatedProfile = await ApiService.updatePatientProfile(formData, token);
      } else {
        updatedProfile = await ApiService.updateDoctorProfile(formData, token);
      }
      
      setProfile(updatedProfile);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) return <Loading message="Loading your profile..." />;

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Not Found</h2>
          <p className="text-gray-600">Please complete your onboarding first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <div className="space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Photo & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-100"
            />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {profile.userType === 'doctor' ? 'Dr. ' : ''}{profile.name}
            </h2>
            <p className="text-gray-600 mb-2">{profile.email}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              profile.userType === 'patient' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
            }`}>
              {profile.userType === 'patient' ? 'Patient' : `${profile.specialty} Specialist`}
            </span>
            
            {profile.userType === 'doctor' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-sm text-gray-500">Rating:</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < Math.floor(profile.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({profile.totalReviews || 0})</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className={`w-full p-3 border rounded-lg ${
                          editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={!editing}
                        className={`w-full p-3 border rounded-lg ${
                          editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                        }`}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className={`w-full p-3 border rounded-lg ${
                        editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                {/* Patient-specific fields */}
                {profile.userType === 'patient' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <option value="">Select Blood Group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Doctor-specific fields */}
                {profile.userType === 'doctor' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                        <select
                          name="specialty"
                          value={formData.specialty || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <option value="">Select Specialty</option>
                          {DOCTOR_SPECIALTIES.map(specialty => (
                            <option key={specialty} value={specialty}>{specialty}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                          <input
                            type="number"
                            name="experience"
                            min="0"
                            max="50"
                            value={formData.experience || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className={`w-full p-3 border rounded-lg ${
                              editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($) *</label>
                          <input
                            type="number"
                            name="consultationFee"
                            min="0"
                            value={formData.consultationFee || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className={`w-full p-3 border rounded-lg ${
                              editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                        <input
                          type="text"
                          name="licenseNumber"
                          value={formData.licenseNumber || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <textarea
                          name="bio"
                          rows="4"
                          value={formData.bio || ''}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className={`w-full p-3 border rounded-lg ${
                            editing ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50'
                          }`}
                          placeholder="Tell patients about yourself, your expertise, and approach to medicine..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
