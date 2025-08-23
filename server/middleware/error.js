const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Wrong MongoDB ID error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate ${field} entered. Please use another value.`;
    err = new ErrorHandler(message, 400);
  }

  // Wrong JWT error
  if (err.name === 'JsonWebTokenError') {
    const message = 'JSON Web Token is invalid. Try Again!';
    err = new ErrorHandler(message, 401);
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    const message = 'JSON Web Token is expired. Try Again!';
    err = new ErrorHandler(message, 401);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(value => value.message);
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
}; 