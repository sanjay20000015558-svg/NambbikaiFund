const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nambikkai-fund';

async function seed() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const User = require('./models/User');
    const Campaign = require('./models/Campaign');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@nambikkai.org' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const admin = new User({
        fullName: 'Admin User',
        email: 'admin@nambikkai.org',
        mobileNumber: '9999999999',
        password: await bcrypt.hash('admin123', salt),
        state: 'Tamil Nadu',
        language: 'en',
        role: 'admin',
        isVerified: true,
        isEmailVerified: true
      });
      await admin.save();
      console.log('Admin user created: admin@nambikkai.org / admin123');
    }

    // Create sample campaigns
    const campaignCount = await Campaign.countDocuments();
    if (campaignCount === 0) {
      const campaigns = [
        {
          title: 'Help for Leukemia Treatment',
          category: 'leukemia',
          shortDescription: 'Supporting a child fighting leukemia',
          description: 'We are raising funds for 8-year-old Priya who is undergoing chemotherapy treatment for leukemia.',
          targetAmount: 500000,
          amountRaised: 150000,
          status: 'approved',
          isUrgent: true,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
          creator: adminExists ? adminExists._id : (await User.findOne({ email: 'admin@nambikkai.org' }))._id
        },
        {
          title: 'Medical Surgery Fund',
          category: 'medical',
          shortDescription: 'Emergency surgery needed',
          description: 'Fundraising for emergency heart surgery.',
          targetAmount: 300000,
          amountRaised: 200000,
          status: 'approved',
          isUrgent: false,
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
          creator: adminExists ? adminExists._id : (await User.findOne({ email: 'admin@nambikkai.org' }))._id
        }
      ];
      await Campaign.insertMany(campaigns);
      console.log('Sample campaigns created');
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();