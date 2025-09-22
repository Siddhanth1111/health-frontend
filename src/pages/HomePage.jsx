import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const HomePage = () => {
  const features = [
    {
      icon: '👨‍⚕️',
      title: 'Expert Doctors',
      description: 'Connect with verified medical professionals across various specialties'
    },
    {
      icon: '🎥',
      title: 'HD Video Consultations',
      description: 'High-quality video calls for face-to-face medical consultations'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'HIPAA-compliant platform ensuring your medical data stays protected'
    },
    {
      icon: '⏰',
      title: '24/7 Availability',
      description: 'Book consultations at your convenience with flexible scheduling'
    }
  ];

  const specialties = [
    '👨‍⚕️ General Medicine',
    '❤️ Cardiology',
    '🧠 Neurology',
    '👶 Pediatrics',
    '🦴 Orthopedics',
    '👁️ Ophthalmology'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Healthcare at Your <span className="text-yellow-300">Fingertips</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Connect with certified doctors instantly through secure video consultations. 
              Get professional medical advice from the comfort of your home.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <SignedOut>
                <Link 
                  to="/sign-up"
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors transform hover:scale-105 shadow-lg"
                >
                  Get Started - It's Free
                </Link>
                <Link 
                  to="/sign-in"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </SignedOut>
              <SignedIn>
                <Link 
                  to="/doctors"
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors transform hover:scale-105 shadow-lg"
                >
                  Browse Doctors
                </Link>
                <Link 
                  to="/dashboard"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of healthcare with our cutting-edge telemedicine platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Medical Specialties Available
            </h2>
            <p className="text-xl text-gray-600">
              Our network of qualified doctors covers all major medical specialties
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {specialties.map((specialty, index) => (
              <div key={index} className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-2xl font-semibold text-blue-600">{specialty}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Healthcare Journey?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of patients who trust our platform for their medical consultations
          </p>
          <SignedOut>
            <Link 
              to="/sign-up"
              className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
            >
              Start Consultation Now
            </Link>
          </SignedOut>
          <SignedIn>
            <Link 
              to="/doctors"
              className="inline-block px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105 shadow-lg"
            >
              Book Consultation
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-gray-300">Verified Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
              <div className="text-gray-300">Happy Patients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">15+</div>
              <div className="text-gray-300">Specialties</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
