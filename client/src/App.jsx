import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectOtpVerification } from './features/auth/authSlice';
import { ThemeProvider } from './contexts/ThemeContext';

// Layouts and Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PersistLogin from './components/PersistLogin';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Inspection Pages
import CreateInspection from './pages/inspections/CreateInspection';
import InspectionList from './pages/inspections/InspectionList';
import EditInspection from './pages/inspections/EditInspection';
import SearchInspections from './pages/inspections/SearchInspections';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const otpVerification = useSelector(selectOtpVerification);

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route element={<PersistLogin />}>
            <Route path="/" element={<Layout />}>
              {/* Public Routes */}
              <Route index element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
              <Route path="register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
              <Route path="verify-otp" element={otpVerification.userId ? <VerifyOTP /> : <Navigate to="/login" />} />
              <Route path="verify-email" element={otpVerification.userId ? <VerifyEmail /> : <Navigate to="/login" />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="password/reset/:token" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="inspections">
                  <Route index element={<InspectionList />} />
                  <Route path="create" element={<CreateInspection />} />
                  <Route path="edit/:id" element={<EditInspection />} />
                  <Route path="search" element={<SearchInspections />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <button 
                    onClick={() => window.history.back()} 
                    className="btn btn-primary"
                  >
                    Go Back
                  </button>
                </div>
              } />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 