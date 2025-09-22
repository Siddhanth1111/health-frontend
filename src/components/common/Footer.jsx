import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">VideoCall Pro</h3>
          <p className="text-gray-400 mb-4">
            Professional video calling solution built with MERN stack
          </p>
          
          <div className="flex justify-center space-x-4 mb-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaGithub className="text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaLinkedin className="text-xl" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FaTwitter className="text-xl" />
            </a>
          </div>
          
          <div className="text-sm text-gray-400">
            © 2025 VideoCall Pro. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
