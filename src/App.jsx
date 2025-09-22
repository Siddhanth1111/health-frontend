import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { SocketProvider } from './context/SocketContext';

import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import DoctorsPage from './pages/DoctorsPage';
import VideoCallRoom from './components/video/VideoCallRoom';
import IncomingCallModal from './components/video/IncomingCallModal';
import Loading from './components/common/Loading';

const AppContent = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <Loading message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in/*" element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <SignInPage />
        } />
        <Route path="/sign-up/*" element={
          isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUpPage />
        } />
        <Route path="/onboarding" element={
          isSignedIn ? <OnboardingPage /> : <Navigate to="/sign-in" replace />
        } />
        <Route path="/dashboard" element={
          isSignedIn ? <DashboardPage /> : <Navigate to="/sign-in" replace />
        } />
        <Route path="/doctors" element={
          isSignedIn ? <DoctorsPage /> : <Navigate to="/sign-in" replace />
        } />
        <Route path="/video-call/:roomId" element={
          isSignedIn ? <VideoCallRoom /> : <Navigate to="/sign-in" replace />
        } />
      </Routes>
      
      <IncomingCallModal />
    </div>
  );
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </Router>
  );
}

export default App;
