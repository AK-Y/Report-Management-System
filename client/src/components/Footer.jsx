import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-[#0066a1] dark:bg-gray-800 text-white py-2 mt-auto">
      <div className="w-4/5 mx-auto px-2">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Reports Management System</h3>
            <p className="text-sm text-gray-200 dark:text-gray-300">
              Streamlining inspection and meeting reports
            </p>
          </div>
          
          <div className="mt-2 md:mt-0">
            <p className="text-sm">© {year} Reports Management System. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 