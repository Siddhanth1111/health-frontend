import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl">🏥</span>
            <span className="text-2xl font-bold text-gray-800">MedConsult</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our medical consultation platform</p>
        </div>
        
        {/* Clerk SignUp Component */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <SignUp 
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/onboarding"
            appearance={{
              elements: {
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                card: "shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 text-gray-700",
                formFieldInput: "border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                identityPreviewEditButtonIcon: "hidden",
                phoneInputBox: "hidden" // Hide phone input
              },
              layout: {
                privacyPageUrl: "https://your-site.com/privacy",
                termsPageUrl: "https://your-site.com/terms"
              }
            }}
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </a>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Why Choose MedConsult?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-lg">✓</span>
              <span className="text-sm text-gray-600">Connect with verified doctors</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-lg">✓</span>
              <span className="text-sm text-gray-600">Secure video consultations</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-lg">✓</span>
              <span className="text-sm text-gray-600">24/7 availability</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-500 text-lg">✓</span>
              <span className="text-sm text-gray-600">HIPAA compliant platform</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
