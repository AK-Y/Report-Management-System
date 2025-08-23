const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/user.model');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies.token) {
      token = req.cookies.token;
    } 
    // Check for token in Authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in query parameters (for download links)
    else if (req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return next(new ErrorHandler('Please login to access this resource', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return next(new ErrorHandler('User not found', 404));
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return next(new ErrorHandler('Not authorized to access this resource', 401));
  }
};

// Middleware to check if phone is verified
exports.isPhoneVerified = async (req, res, next) => {
  if (!req.user.isPhoneVerified) {
    return next(new ErrorHandler('Please verify your phone number', 403));
  }
  next();
};

// Middleware to authorize roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.role}) is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
}; 