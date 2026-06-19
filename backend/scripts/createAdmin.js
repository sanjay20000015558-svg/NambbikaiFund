const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nambikkai-fund';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@nambikkai.org' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      console.log('Email: admin@nambikkai.org');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@nambikkai.org',
      mobileNumber: '9999999999',
      password: hashedPassword,
      state: 'Tamil Nadu',
      language: 'en',
      role: 'admin',
      isVerified: true,
      isEmailVerified: true
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@nambikkai.org');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();