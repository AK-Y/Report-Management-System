const express = require('express');
const { check } = require('express-validator');
const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword
} = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Registration and OTP verification
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('phoneNumber', 'Please enter a valid 10-digit phone number').matches(/^[0-9]{10}$/),
    check('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
    check('designation', 'Designation is required').isIn(['CE', 'SE', 'EE', 'SDE'])
  ],
  registerUser
);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Login and logout
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  loginUser
);
router.get('/logout', logoutUser);

// Password management
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticated, updatePassword);

// User profile
router.get('/me', isAuthenticated, getUserProfile);

module.exports = router; 