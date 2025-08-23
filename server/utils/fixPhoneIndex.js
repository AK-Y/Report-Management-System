/**
 * This script fixes the phone index issue by:
 * 1. Dropping the problematic phone index
 * 2. Ensuring phoneNumber field is properly indexed instead
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function fixPhoneIndex() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    
    // List all indexes in the users collection
    console.log('Current indexes in users collection:');
    const indexes = await db.collection('users').indexes();
    console.log(JSON.stringify(indexes, null, 2));
    
    // Check if phone index exists and drop it
    try {
      console.log('Dropping phone index...');
      await db.collection('users').dropIndex('phone_1');
      console.log('Successfully dropped phone index');
    } catch (error) {
      console.log('No phone index to drop or error:', error.message);
    }
    
    // Add phoneNumber index if it doesn't exist
    try {
      console.log('Creating phoneNumber index...');
      await db.collection('users').createIndex({ phoneNumber: 1 }, { unique: true });
      console.log('Successfully created phoneNumber index');
    } catch (error) {
      console.log('Error creating phoneNumber index:', error.message);
    }
    
    // Update all users to set phoneNumber = phone if phoneNumber is missing
    console.log('Updating users to ensure phoneNumber is set...');
    const result = await db.collection('users').updateMany(
      { phoneNumber: { $exists: false } },
      [{ $set: { phoneNumber: '$phone' } }]
    );
    console.log(`Updated ${result.modifiedCount} users`);
    
    // List all indexes after changes
    console.log('Updated indexes in users collection:');
    const updatedIndexes = await db.collection('users').indexes();
    console.log(JSON.stringify(updatedIndexes, null, 2));
    
    console.log('Database fix completed successfully.');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
fixPhoneIndex(); 