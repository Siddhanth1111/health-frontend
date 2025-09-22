import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your medical consultation account</p>
        </div>
        <SignIn 
          path="/sign-in" 
          routing="path" 
          signUpUrl="/sign-up"
          afterSignInUrl="/onboarding"
        />
      </div>
    </div>
  );
};

export default SignInPage;
