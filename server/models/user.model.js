const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
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
      unique: true,
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
      unique: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
      validate: {
        validator: function(v) {
          return v && v.length > 0; // Ensure it's not empty
        },
        message: 'Phone number cannot be empty'
      },
      index: true  // Ensure proper indexing
    },
    phone: {
      type: String,
      index: false, // We don't need an index on this
      // No unique constraint here to avoid conflicts
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    designation: {
      type: String,
      required: [true, 'Please enter your designation'],
      enum: ['CE', 'SE', 'EE', 'SDE'],
      default: 'SDE'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isEmailVerified: {
      type: Boolean,
      default: false
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
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);


// password hashing middleware
userSchema.pre('save', async function(next) {
  // Skip if password isn't modified or is already hashed
  if (!this.isModified('password') || this.password.startsWith('$2b$10$')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Copy phoneNumber to phone field
userSchema.pre('save', function(next) {
  if (this.isModified('phoneNumber')) {
    this.phone = this.phoneNumber;
  }
  next();
});

// Improved password comparison method
userSchema.methods.comparePassword = async function(enteredPassword) {
  try {
    console.log(`Comparing entered password with hash: ${this.password}`);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    throw error;
  }
};



// Generate JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set token expire time
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', userSchema); 