const crypto = require('crypto');
const { validationResult } = require('express-validator');
const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/user.model');
const TempUser = require('../models/tempUser.model');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const sendOTP = require('../utils/sendOTP');
const sendEmailOTP = require('../utils/sendEmailOTP');
const generateOTP = require('../utils/generateOTP');
const bcrypt = require('bcryptjs');

// Register a user => /api/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phoneNumber, password, designation } = req.body;

    // Validate phone number
    if (!phoneNumber || phoneNumber.trim() === '') {
      return next(
        new ErrorHandler('Phone number is required', 400)
      );
    }

    // Ensure phone number is in the correct format (10 digits)
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      return next(
        new ErrorHandler('Please provide a valid 10-digit phone number', 400)
      );
    }

    console.log(`Registration attempt with email: ${email}, phone: ${phoneNumber}`);

    // Check if user already exists in the permanent User collection
    const existingUserByEmail = await User.findOne({ email });
    const existingUserByPhone = await User.findOne({ 
      $or: [
        { phoneNumber }, 
        { phone: phoneNumber }
      ] 
    });


    console.log(`Existing user by email: ${existingUserByEmail ? 'Found' : 'Not found'}`);
    console.log(`Existing user by phone: ${existingUserByPhone ? 'Found' : 'Not found'}`);

    if (existingUserByEmail) {
      return next(
        new ErrorHandler('User with this email already exists', 400)
      );
    }

    if (existingUserByPhone) {
      return next(
        new ErrorHandler('User with this phone number already exists', 400)
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Original password:', password);
    console.log('Hashed password:', hashedPassword);

    // Send OTP via email
    console.log(`Sending OTP to email: ${email}, OTP: ${otp}`);
    const otpSent = await sendEmailOTP(email, otp, name);

    if (!otpSent) {
      console.error('Failed to send OTP email during registration');
      return next(
        new ErrorHandler('Failed to send verification email. Please try again or contact support.', 500)
      );
    }

    // Create temporary user instead of permanent user
    const tempUserData = {
      name,
      email,
      phoneNumber,
      password: hashedPassword, // Store the hashed password
      designation,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt,
        verifyType: 'email'
      }
    };

    console.log('Creating temporary user with data:', JSON.stringify(tempUserData, null, 2));
    const tempUser = await TempUser.create(tempUserData);

    console.log(`Temporary user created successfully with ID: ${tempUser._id}`);
    
    // Return success response with tempUserId
    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please check your email for verification code.',
      userId: tempUser._id,
      requireEmailVerification: true
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.error(`Duplicate key error for field: ${field}`);
      console.error(`Duplicate key value: ${error.keyValue ? error.keyValue[field] : 'null'}`);
      
      // Special handling for phone/phoneNumber confusion
      if (field === 'phone' || field === 'phoneNumber') {
        return next(
          new ErrorHandler('User with this phone number already exists', 400)
        );
      }
      
      return next(
        new ErrorHandler(`User with this ${field} already exists`, 400)
      );
    }
    
    next(error);
  }
};

// Verify OTP => /api/auth/verify-otp
exports.verifyOTP = async (req, res, next) => {
  try {
    const { userId, otp, verifyType = 'email' } = req.body;

    // Find temporary user
    const tempUser = await TempUser.findById(userId);
    if (!tempUser) {
      return next(new ErrorHandler('Registration session not found or expired', 404));
    }

    // Validate OTP
    if (!tempUser.otp?.code || !tempUser.otp?.expiresAt || tempUser.otp.expiresAt < Date.now()) {
      return next(new ErrorHandler('OTP not found or expired', 400));
    }
    if (tempUser.otp.code !== otp) {
      return next(new ErrorHandler('Invalid OTP', 400));
    }

    // Create user document manually to bypass hooks
    const user = new User({
      name: tempUser.name,
      email: tempUser.email,
      phoneNumber: tempUser.phoneNumber,
      phone: tempUser.phoneNumber,
      password: tempUser.password,
      designation: tempUser.designation,
      isPhoneVerified: true,
      isEmailVerified: true
    });

    // Save without triggering hooks
    await user.save({ validateBeforeSave: false });

    // Verify the hash was preserved
    if (user.password !== tempUser.password) {
      console.error('Password hash changed during user creation!');
      throw new Error('Password hash mismatch');
    }

    // Clean up
    await TempUser.findByIdAndDelete(userId);
    sendToken(user, 200, res);
  } catch (error) {
    console.error('OTP verification error:', error);
    next(error);
  }
};



// Resend OTP => /api/auth/resend-otp
exports.resendOTP = async (req, res, next) => {
  try {
    const { userId, verifyType = 'email' } = req.body;

    // Find temporary user by ID
    const tempUser = await TempUser.findById(userId);

    if (!tempUser) {
      return next(new ErrorHandler('Registration session not found or expired', 404));
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update temporary user with new OTP
    tempUser.otp = {
      code: otp,
      expiresAt: otpExpiresAt,
      verifyType
    };
    await tempUser.save();

    // Send OTP based on verification type
    let otpSent = false;
    
    if (verifyType === 'email') {
      // Send OTP via email
      console.log(`Resending OTP to email: ${tempUser.email}, OTP: ${otp}`);
      otpSent = await sendEmailOTP(tempUser.email, otp, tempUser.name);
      
      if (!otpSent) {
        console.error('Failed to resend OTP email');
        return next(
          new ErrorHandler('Failed to send verification email. Please try again.', 500)
        );
      }
    } else if (verifyType === 'phone') {
      // Send OTP via SMS (not used in development)
      console.log(`Resending OTP to phone: ${tempUser.phoneNumber}, OTP: ${otp}`);
      // otpSent = await sendOTP(tempUser.phoneNumber, otp);
      otpSent = true; // For development
      
      if (!otpSent) {
        console.error('Failed to resend OTP SMS');
        return next(
          new ErrorHandler('Failed to send verification SMS. Please try again.', 500)
        );
      }
    }
    
    // Enhanced success response with specific message
    res.status(200).json({
      success: true,
      message: `Verification code resent to your ${verifyType === 'email' ? 'email' : 'phone'}`
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    next(error);
  }
};

// Login user => /api/auth/login
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler('Please enter email and password', 400));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Debug logging
    console.log('Login attempt details:', {
      enteredPassword: password,
      storedHash: user.password,
      comparison: await bcrypt.compare(password, user.password)
    });

    if (!await user.comparePassword(password)) {
      return next(new ErrorHandler('Invalid email or password', 401));
    }

    // Development auto-verification
    if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    sendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};


// Logout user => /api/auth/logout
exports.logoutUser = async (req, res, next) => {
  try {
    res.cookie('token', null, {
      expires: new Date(Date.now()),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password => /api/auth/password/forgot
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return next(new ErrorHandler('User not found with this email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset password url
    const resetUrl = `${process.env.CLIENT_URL}/password/reset/${resetToken}`;

    const message = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Please click on the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Inspection Management System Password Recovery',
        message
      });

      res.status(200).json({
        success: true,
        message: `Email sent to: ${user.email}`
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    next(error);
  }
};

// Reset password => /api/auth/password/reset/:token
exports.resetPassword = async (req, res, next) => {
  try {
    // Hash URL token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(
        new ErrorHandler(
          'Password reset token is invalid or has expired',
          400
        )
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler('Passwords do not match', 400));
    }

    // Setup new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get currently logged in user details => /api/auth/me
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update / Change password => /api/auth/password/update
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword);
    if (!isMatched) {
      return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
}; 