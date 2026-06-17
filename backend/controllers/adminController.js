const asyncHandler = require('../middlewares/asyncHandler');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const Withdrawal = require('../models/Withdrawal');
const Notification = require('../models/Notification');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, isVerified, search } = req.query;

  const query = {};

  if (role) query.role = role;
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobileNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query)
  ]);

  const pages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages,
    data: users
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
exports.getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select('-password')
    .populate('campaigns', 'title status amountRaised createdAt')
    .populate('withdrawalRequests', 'amount status createdAt');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's stats
  const totalDonations = await Donation.countDocuments({ donor: id, paymentStatus: 'captured' });
  const totalAmountDonated = await Donation.findOne({ donor: id, paymentStatus: 'captured' })
    .select('amount')
    .sort({ createdAt: -1 });

  // Get campaigns count
  const campaignsCount = await Campaign.countDocuments({ creator: id });

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      stats: {
        totalDonations,
        totalAmountDonated: totalAmountDonated || 0,
        campaignsCount
      }
    }
  });
});

// @desc    Update user role/status (admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, isVerified, isBanned, banReason } = req.body;

  const updateData = {};

  if (role) updateData.role = role;
  if (typeof isVerified !== 'undefined') updateData.isVerified = isVerified;
  if (typeof isBanned !== 'undefined') {
    updateData.isBanned = isBanned;
    if (isBanned) {
      updateData.banReason = banReason || 'Banned by admin';
      updateData.bannedAt = new Date();
      updateData.bannedBy = req.user._id;
    } else {
      updateData.banReason = undefined;
      updateData.bannedAt = undefined;
      updateData.bannedBy = undefined;
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete your own account'
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Soft delete: anonymize data instead of deleting
  await User.findByIdAndUpdate(id, {
    $set: {
      fullName: 'Deleted User',
      email: `deleted_${id}@deleted.com`,
      mobileNumber: '0000000000',
      isBanned: true,
      banReason: 'Account deleted by admin'
    }
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Parallel queries for stats
  const [
    totalUsers,
    totalCreators,
    totalDonors,
    totalCampaigns,
    pendingCampaigns,
    approvedCampaigns,
    rejectedCampaigns,
    totalDonations,
    totalAmountRaised,
    pendingWithdrawals,
    recentCampaigns,
    recentDonations
  ] = await Promise.all([
    User.countDocuments(dateFilter),
    User.countDocuments({ ...dateFilter, role: 'creator' }),
    User.countDocuments({ ...dateFilter, role: 'donor' }),
    Campaign.countDocuments(dateFilter),
    Campaign.countDocuments({ ...dateFilter, status: 'pending' }),
    Campaign.countDocuments({ ...dateFilter, status: 'approved' }),
    Campaign.countDocuments({ ...dateFilter, status: 'rejected' }),
    Donation.countDocuments({ ...dateFilter, paymentStatus: 'captured' }),
    Donation.aggregate([
      { $match: { ...dateFilter, paymentStatus: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Withdrawal.countDocuments({ status: 'pending' }),
    Campaign.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('creator', 'fullName'),
    Donation.find({ ...dateFilter, paymentStatus: 'captured' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('donor', 'fullName')
      .populate('campaign', 'title')
  ]);

  const amountRaised = totalAmountRaised.length > 0 ? totalAmountRaised[0].total : 0;

  // Monthly growth (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyGrowth = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'captured',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Category breakdown
  const categoryBreakdown = await Campaign.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amountRaised' },
        totalCampaigns: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalCreators,
        totalDonors,
        totalCampaigns,
        pendingCampaigns,
        approvedCampaigns,
        rejectedCampaigns,
        totalDonations,
        totalAmountRaised: amountRaised,
        pendingWithdrawals
      },
      monthlyGrowth,
      categoryBreakdown,
      recentCampaigns,
      recentDonations
    }
  });
});

// @desc    Get all campaigns (admin view)
// @route   GET /api/admin/campaigns
// @access  Private (Admin/Verifier)
exports.getAllCampaigns = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    search
  } = req.query;

  const query = {};

  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else if (status === 'pending') {
      query.status = { $in: ['pending', 'submitted'] };
    } else {
      query.status = status;
    }
  }
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { 'creatorName': { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [campaigns, total] = await Promise.all([
    Campaign.find(query)
      .populate('creator', 'fullName email mobileNumber')
      .populate('verifiedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Campaign.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: campaigns.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: campaigns
  });
});

// @desc    Approve/reject campaign
// @route   PUT /api/admin/campaigns/:id/approve
// @access  Private (Admin/Verifier)
exports.approveCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  campaign.status = status;
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();
  if (notes) {
    campaign.verificationNotes.push({
      note: notes,
      addedBy: req.user._id
    });
  }

  await campaign.save();

  // Send notification to creator
  await Notification.create({
    recipient: campaign.creator,
    type: status === 'approved' ? 'campaign_approved' : 'campaign_rejected',
    title: status === 'approved' ? 'Campaign Approved!' : 'Campaign Rejected',
    message: status === 'approved'
      ? `Your campaign "${campaign.title}" is now live and accepting donations.`
      : `Your campaign "${campaign.title}" was rejected. ${notes || ''}`,
    icon: status === 'approved' ? 'check_circle' : 'warning',
    color: status === 'approved' ? 'success' : 'error',
    link: `/dashboard/campaigns/${campaign._id}`,
    relatedTo: {
      model: 'Campaign',
      id: campaign._id
    }
  });

  res.status(200).json({
    success: true,
    message: status === 'approved' ? 'Campaign approved successfully' : 'Campaign rejected',
    data: campaign
  });
});

// @desc    Verify/reject campaign (verifier action)
// @route   PUT /api/admin/campaigns/:id/verify
// @access  Private (Verifier/Admin)
exports.verifyCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!['approved', 'rejected', 'verified'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Update campaign
  campaign.status = status;
  campaign.reviewedBy = req.user._id;
  campaign.reviewedAt = new Date();
  if (notes) {
    campaign.verificationNotes.push({
      note: notes,
      addedBy: req.user._id
    });
  }

  await campaign.save();

  // Send notification to creator
  await Notification.create({
    recipient: campaign.creator,
    type: status === 'approved' ? 'campaign_approved' : 'campaign_rejected',
    title: status === 'approved' ? 'Campaign Approved!' : 'Campaign Rejected',
    message: status === 'approved'
      ? `Your campaign "${campaign.title}" is now live and accepting donations.`
      : `Your campaign "${campaign.title}" was rejected. ${notes || ''}`,
    icon: status === 'approved' ? 'check_circle' : 'warning',
    color: status === 'approved' ? 'success' : 'error',
    link: `/dashboard/campaigns/${campaign._id}`,
    relatedTo: {
      model: 'Campaign',
      id: campaign._id
    }
  });

  res.status(200).json({
    success: true,
    message: status === 'approved' ? 'Campaign approved successfully' : 'Campaign rejected',
    data: campaign
  });
});

// @desc    Flag/unflag campaign (fraud detection)
// @route   PUT /api/admin/campaigns/:id/flag
// @access  Private (Admin/Verifier)
exports.flagCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, flag } = req.body;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  campaign.isFlagged = flag !== false; // Default to true if not specified
  if (reason) campaign.flagReason = reason;
  if (req.user) campaign.flaggedBy = req.user._id;
  if (flag === false) {
    campaign.flagReason = undefined;
    campaign.flaggedBy = undefined;
  }

  await campaign.save();

  res.status(200).json({
    success: true,
    message: flag !== false ? 'Campaign flagged for review' : 'Campaign unflagged',
    data: campaign
  });
});

// @desc    Get all withdrawal requests (admin)
// @route   GET /api/admin/withdrawals
// @access  Private (Admin)
exports.getAllWithdrawals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(query)
      .populate('creator', 'fullName email')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Withdrawal.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: withdrawals.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: withdrawals
  });
});

// @desc    Process withdrawal request
// @route   PUT /api/admin/withdrawals/:id/process
// @access  Private (Admin)
exports.processWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes, transactionId, utr, paymentMode } = req.body;

  if (!['approved', 'paid', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const withdrawal = await Withdrawal.findById(id);

  if (!withdrawal) {
    return res.status(404).json({
      success: false,
      message: 'Withdrawal request not found'
    });
  }

  withdrawal.status = status;
  withdrawal.approvedBy = req.user._id;
  withdrawal.approvedAt = new Date();

  if (status === 'paid') {
    withdrawal.paymentDetails = {
      transactionId,
      paymentMode,
      utr,
      paymentDate: new Date()
    };

    // Deduct from campaign's available balance
    await Campaign.findByIdAndUpdate(withdrawal.campaign, {
      $inc: { totalWithdrawn: withdrawal.amount, availableBalance: -withdrawal.amount }
    });
  }

  if (status === 'rejected') {
    withdrawal.rejectionReason = notes;
    // Refund to campaign balance
    await Campaign.findByIdAndUpdate(withdrawal.campaign, {
      $inc: { availableBalance: withdrawal.amount }
    });
  }

  await withdrawal.save();

  // Notify campaign creator
  await Notification.create({
    recipient: withdrawal.creator,
    type: 'withdrawal_' + status,
    title: 'Withdrawal ' + status.charAt(0).toUpperCase() + status.slice(1),
    message: `Your withdrawal request of ₹${withdrawal.amount} has been ${status}`,
    icon: status === 'approved' ? '✅' : status === 'paid' ? '💰' : '❌',
    color: status === 'approved' || status === 'paid' ? 'success' : 'error',
    link: '/dashboard/withdrawals',
    relatedTo: {
      model: 'Withdrawal',
      id: withdrawal._id
    }
  });

  res.status(200).json({
    success: true,
    message: `Withdrawal ${status} successfully`,
    data: withdrawal
  });
});

// @desc    Get alerts and analytics
// @route   GET /api/admin/alerts
// @access  Private (Admin)
exports.getAlerts = asyncHandler(async (req, res) => {
  // Suspicious campaigns
  const suspiciousCampaigns = await Campaign.find({ isFlagged: true, status: 'approved' })
    .populate('creator', 'fullName email')
    .limit(10);

  // Pending campaigns
  const pendingCampaigns = await Campaign.find({ status: 'pending' })
    .populate('creator', 'fullName email')
    .limit(10);

  // Recent large donations (potential fraud check)
  const largeDonations = await Donation.find({
    paymentStatus: 'captured',
    amount: { $gt: 50000 } // ₹50k+
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('donor', 'fullName email')
    .populate('campaign', 'title');

  res.status(200).json({
    success: true,
    data: {
      suspiciousCampaigns,
      pendingCampaigns,
      largeDonations
    }
  });
});

// @desc    Get language statistics
// @route   GET /api/admin/languages/stats
// @access  Private (Admin)
exports.getLanguageStats = asyncHandler(async (req, res) => {
  // Get user language preferences
  const userLanguageStats = await User.aggregate([
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get campaign translation coverage
  const CampaignTranslation = require('../models/CampaignTranslation');
  const totalCampaigns = await Campaign.countDocuments();
  const translatedCampaigns = await CampaignTranslation.distinct('campaign');
  const translationStats = await CampaignTranslation.aggregate([
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const allLanguages = [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' }
  ];

  const languageCoverage = allLanguages.map(lang => {
    const userStat = userLanguageStats.find(s => s._id === lang.code);
    const transStat = translationStats.find(s => s._id === lang.code);
    return {
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      dir: lang.dir,
      userCount: userStat?.count || 0,
      campaignCount: transStat?.count || 0,
      coverage: totalCampaigns > 0 ? Math.round((transStat?.count || 0) / totalCampaigns * 100) : 0
    };
  });

  res.status(200).json({
    success: true,
    data: {
      languages: languageCoverage,
      totalCampaigns,
      totalTranslatedCampaigns: translatedCampaigns.length
    }
  });
});

// @desc    Get translations for a language
// @route   GET /api/admin/translations/:language
// @access  Private (Admin)
exports.getTranslations = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const fs = require('fs');
  const path = require('path');
  const translationPath = path.join(__dirname, '../../frontend/public/locales', language, 'translation.json');

  try {
    if (fs.existsSync(translationPath)) {
      const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
      res.status(200).json({
        success: true,
        data: translations
      });
    } else {
      res.status(200).json({
        success: true,
        data: {},
        message: 'No translations found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading translations'
    });
  }
});

// @desc    Update translation for a language
// @route   POST /api/admin/translations/:language
// @access  Private (Admin)
exports.updateTranslation = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { key, value } = req.body;
  const fs = require('fs');
  const path = require('path');

  const translationPath = path.join(__dirname, '../../frontend/public/locales', language, 'translation.json');
  const dirPath = path.join(__dirname, '../../frontend/public/locales', language);

  // Create directory if not exists
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  let translations = {};
  if (fs.existsSync(translationPath)) {
    translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
  }

  // Update translation
  const keys = key.split('.');
  let current = translations;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;

  fs.writeFileSync(translationPath, JSON.stringify(translations, null, 2));

  res.status(200).json({
    success: true,
    message: 'Translation updated successfully'
  });
});

// @desc    Export translations for a language
// @route   GET /api/admin/translations/:language/export
// @access  Private (Admin)
exports.exportTranslations = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const fs = require('fs');
  const path = require('path');

  const translationPath = path.join(__dirname, '../../frontend/public/locales', language, 'translation.json');

  try {
    if (fs.existsSync(translationPath)) {
      const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${language}_translations.json`);
      res.send(translations);
    } else {
      res.status(404).json({
        success: false,
        message: 'Translations not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting translations'
    });
  }
});

// @desc    Import translations for a language
// @route   POST /api/admin/translations/:language/import
// @access  Private (Admin)
exports.importTranslations = asyncHandler(async (req, res) => {
  const { language } = req.params;
  const { translations } = req.body;
  const fs = require('fs');
  const path = require('path');

  if (!translations) {
    return res.status(400).json({
      success: false,
      message: 'Translations are required'
    });
  }

  const dirPath = path.join(__dirname, '../../frontend/public/locales', language);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const translationPath = path.join(dirPath, 'translation.json');
  fs.writeFileSync(translationPath, JSON.stringify(translations, null, 2));

  res.status(200).json({
    success: true,
    message: 'Translations imported successfully'
  });
});

module.exports = exports;