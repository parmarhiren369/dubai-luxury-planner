const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wtb-tourism';

console.log('🔍 Testing MongoDB connection...');
console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ ERROR: Failed to connect to MongoDB');
    console.log('📝 Error details:', error.message);
    console.log('\n💡 Solutions:');
    console.log('   1. Make sure MongoDB is running locally');
    console.log('   2. Or update MONGODB_URI in .env with MongoDB Atlas connection string');
    process.exit(1);
  });
