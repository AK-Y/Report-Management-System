const TempUser = require('../models/tempUser.model');

/**
 * Cleanup expired temporary user records
 * This can be run as a scheduled task using a cron job
 */
const cleanupTempUsers = async () => {
  try {
    console.log('Running cleanup for expired temporary user records...');
    
    // Find and delete temporary users with expired OTPs
    const expiredUsers = await TempUser.deleteMany({
      'otp.expiresAt': { $lt: new Date() }
    });
    
    console.log(`Deleted ${expiredUsers.deletedCount} expired temporary user records`);
    
    return {
      success: true,
      deletedCount: expiredUsers.deletedCount
    };
  } catch (error) {
    console.error('Error cleaning up temporary users:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = cleanupTempUsers; 