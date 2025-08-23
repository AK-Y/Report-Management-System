const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email'
      ]
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please enter your phone number'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [8, 'Password must be at least 8 characters']
    },
    designation: {
      type: String,
      required: [true, 'Please enter your designation'],
      enum: ['CE', 'SE', 'EE', 'SDE'],
      default: 'SDE'
    },
    otp: {
      code: String,
      expiresAt: Date,
      verifyType: {
        type: String,
        enum: ['email', 'phone'],
        default: 'email'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600 // Automatically delete after 1 hour if not verified
    }
  }
);

module.exports = mongoose.model('TempUser', tempUserSchema); 