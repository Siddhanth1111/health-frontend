import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileSelector from '../components/auth/ProfileSelector';

const LoginPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">
        Select Your Profile
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Choose a profile to start video calling
      </p>
      <ProfileSelector redirectTo={from} />
    </div>
  );
};

export default LoginPage;
