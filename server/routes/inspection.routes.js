const express = require('express');
const {
  createInspection,
  getAllInspections,
  getInspectionDetails,
  updateInspection,
  deleteInspection,
  searchInspections,
  downloadInspectionReport,
  getAllUsersInspections
} = require('../controllers/inspection.controller');
const { isAuthenticated, isPhoneVerified } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Create inspection
router.post(
  '/',
  isAuthenticated,
  isPhoneVerified,
  upload.single('file'),
  createInspection
);

// Get all inspections
router.get('/', isAuthenticated, getAllInspections);

// Get all inspections for all users
router.get('/all', isAuthenticated, getAllUsersInspections);

// Search inspections
router.post('/search', isAuthenticated, searchInspections);

// Download inspection report - moved before :id route to avoid conflicts
router.get('/download', isAuthenticated, downloadInspectionReport);

// Get single inspection
router.get('/:id', isAuthenticated, getInspectionDetails);

// Update inspection
router.put(
  '/:id',
  isAuthenticated,
  isPhoneVerified,
  upload.single('file'),
  updateInspection
);

// Delete inspection
router.delete('/:id', isAuthenticated, deleteInspection);

module.exports = router; 