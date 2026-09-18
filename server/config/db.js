const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    console.error('⚠️  Server will continue running without database connection.');
    console.error('   Update MONGODB_URI in server/.env to connect to MongoDB Atlas.');
    // Note: Not calling process.exit(1) here so the server stays up
    // and /api/test can still be verified during development setup.
  }
};

module.exports = connectDB;
