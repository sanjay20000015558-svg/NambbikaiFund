const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const crypto = require('crypto');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('campaigns', 'title slug status amountRaised targetAmount deadline createdAt')
    .select('-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken -emailVerificationExpires');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    mobileNumber,
    dateOfBirth,
    gender,
    address,
    state,
    district,
    language
  } = req.body;

  const updateData = {};

  if (fullName) updateData.fullName = fullName;
  if (mobileNumber) updateData.mobileNumber = mobileNumber;
  if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
  if (gender) updateData.gender = gender;
  if (address) updateData.address = typeof address === 'object' ? address : JSON.parse(address);
  if (state) updateData.state = state;
  if (district) updateData.district = district;
  if (language) updateData.language = language;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  // Delete old profile picture from cloudinary
  const user = await User.findById(req.user._id);
  if (user.profilePicture?.publicId) {
    const { deleteFromCloudinary } = require('../config/cloudinary');
    await deleteFromCloudinary(user.profilePicture.publicId);
  }

  // Update profile picture
  user.profilePicture = {
    url: req.file.secure_url,
    publicId: req.file.public_id
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile picture updated successfully',
    data: user.profilePicture
  });
});

// @desc    Get user's campaigns
// @route   GET /api/users/my-campaigns
// @access  Private
exports.getMyCampaigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { creator: req.user._id };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [campaigns, total] = await Promise.all([
    Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Campaign.countDocuments(query)
  ]);

  // Enhance with computed fields
  const enhancedCampaigns = campaigns.map(c => ({
    ...c,
    progress: Math.round((c.amountRaised / c.targetAmount) * 100),
    daysRemaining: Math.max(0, Math.ceil((new Date(c.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  }));

  res.status(200).json({
    success: true,
    count: enhancedCampaigns.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: enhancedCampaigns
  });
});

// @desc    Get user's donations
// @route   GET /api/users/my-donations
// @access  Private
exports.getMyDonations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const donations = await Donation.find({ donor: req.user._id })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('campaign', 'title slug status');

  const total = await Donation.countDocuments({ donor: req.user._id });

  res.status(200).json({
    success: true,
    count: donations.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: donations
  });
});

// @desc    Delete account
// @route   DELETE /api/users/account
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res) => {
  const { password, reason } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Incorrect password'
    });
  }

  // Anonymize user data (keep for analytics/legal compliance)
  user.fullName = 'Deleted User';
  user.email = `deleted_${user._id}@deleted.com`;
  user.mobileNumber = '0000000000';
  user.password = crypto.randomBytes(32).toString('hex');
  user.isBanned = true;
  user.banReason = reason || 'User requested deletion';

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Toggle email notifications
// @route   PUT /api/users/notification-preferences
// @access  Private
exports.updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { emailNotifications } = req.body;

  await User.findByIdAndUpdate(req.user._id, {
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true
  });

  res.status(200).json({
    success: true,
    message: 'Notification preferences updated'
  });
});
