// const connectDatabase = require('./config/database');
// const errorMiddleware = require('./middleware/error');
const cleanupTempUsers = require('./utils/cleanupTempUsers');

// Schedule cleanup of expired temporary users every hour
setInterval(async () => {
  try {
    const result = await cleanupTempUsers();
    console.log('Scheduled cleanup result:', result);
  } catch (error) {
    console.error('Error in scheduled cleanup:', error);
  }
}, 60 * 60 * 1000); // Run every hour 