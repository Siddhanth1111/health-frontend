import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react';

const Header = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <header className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🏥</span>
            <span className="text-xl font-bold text-gray-800">MedConsult</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            {/* User Info */}
            {isSignedIn ? (
              <>
                <Link 
                  to="/dashboard"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/doctors"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <span>👨‍⚕️</span>
                  <span>Doctors</span>
                </Link>
                
                <Link 
                  to="/consultations"
                  className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                >
                  <span>📅</span>
                  <span>Consultations</span>
                </Link>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <img
                    src={user?.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=10b981&color=fff&size=40`}
                    alt={user?.fullName || 'User'}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=User&background=10b981&color=fff&size=40`;
                    }}
                  />
                  <span className="hidden md:inline">{user?.firstName || user?.fullName || 'User'}</span>
                </div>
                
                <SignOutButton>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                    <span>🚪</span>
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </SignOutButton>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/sign-in"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/sign-up"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isSignedIn && (
          <div className="md:hidden mt-3 pt-3 border-t">
            <div className="flex justify-around">
              <Link 
                to="/dashboard"
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <span>🏠</span>
                <span className="text-xs">Dashboard</span>
              </Link>
              
              <Link 
                to="/doctors"
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <span>👨‍⚕️</span>
                <span className="text-xs">Doctors</span>
              </Link>
              
              <Link 
                to="/consultations"
                className="flex flex-col items-center space-y-1 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <span>📅</span>
                <span className="text-xs">Consultations</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
