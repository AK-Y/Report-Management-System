const express = require('express');
const {
  updateProfile,
  getAllUsers,
  getUserDetails,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');
const { isAuthenticated, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// User routes
router.put('/profile', isAuthenticated, updateProfile);

// Admin routes
router.get(
  '/admin/users',
  isAuthenticated,
  authorizeRoles('admin'),
  getAllUsers
);
router.get(
  '/admin/user/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  getUserDetails
);
router.put(
  '/admin/user/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  updateUser
);
router.delete(
  '/admin/user/:id',
  isAuthenticated,
  authorizeRoles('admin'),
  deleteUser
);

module.exports = router; 