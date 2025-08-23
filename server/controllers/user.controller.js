const ErrorHandler = require('../utils/errorHandler');
const User = require('../models/user.model');

// Update user profile => /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      designation: req.body.designation
    };

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only) => /api/users/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Get user details (admin only) => /api/users/admin/user/:id
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Update user (admin only) => /api/users/admin/user/:id
exports.updateUser = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      designation: req.body.designation,
      role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (admin only) => /api/users/admin/user/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}; 