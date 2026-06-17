const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user (let Mongoose pre-save hook handle password hashing)
    let admin = await User.findOne({ email: 'admin@nambikkai.org' });
    if (!admin) {
      admin = await User.create({
        fullName: 'Admin User',
        email: 'admin@nambikkai.org',
        mobileNumber: '9999999999',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        isEmailVerified: true
      });
      console.log('Admin created: admin@nambikkai.org / admin123');
    }

    // Create demo campaigns with status: 'pending' (waiting for approval)
    const campaigns = [
      {
        title: 'Help 8-year-old Arjun fight Leukemia',
        category: 'leukemia',
        shortDescription: 'Arjun needs immediate chemotherapy treatment for his leukemia diagnosis.',
        description: 'Arjun is a brave 8-year-old who was diagnosed with acute lymphoblastic leukemia last month. He needs 6 months of chemotherapy treatment to have a chance at recovery.',
        targetAmount: 800000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        urgency: 'high',
        isUrgent: true,
        status: 'pending',
        amountRaised: 0,
        donorsCount: 0
      },
      {
        title: 'Support Priyas Heart Surgery',
        category: 'medical',
        shortDescription: 'Priya needs life-saving heart surgery.',
        description: 'Priya, age 24, has a rare heart condition that requires immediate surgical intervention.',
        targetAmount: 350000,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        urgency: 'high',
        isUrgent: true,
        status: 'pending',
        amountRaised: 0,
        donorsCount: 0
      }
    ];

    for (const campaignData of campaigns) {
      const exists = await Campaign.findOne({ title: campaignData.title });
      if (!exists) {
        campaignData.creator = admin._id;
        campaignData.creatorName = admin.fullName;
        campaignData.creatorEmail = admin.email;
        const campaign = await Campaign.create(campaignData);
        campaign.slug = `${campaign._id}-help-${campaignData.title.toLowerCase().replace(/\s+/g, '-')}`;
        await campaign.save();
      }
    }

    console.log('Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();