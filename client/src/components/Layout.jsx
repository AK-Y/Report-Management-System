import React from 'react';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';

const Layout = ({ children }) => {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar />
      <main className="flex-grow w-full pt-2">
        {children || <Outlet />}
      </main>
      <Footer />
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        theme={theme}
        className="mt-16"
      />
    </div>
  );
};

export default Layout; 