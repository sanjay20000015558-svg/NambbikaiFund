const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 6.x+ uses unified topology by default
      // No need for useNewUrlParser/useUnifiedTopology
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Don't exit process here, let server.js handle it
    throw error;
  }
};

module.exports = connectDB;
