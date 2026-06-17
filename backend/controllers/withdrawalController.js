const asyncHandler = require('../middlewares/asyncHandler');
const Withdrawal = require('../models/Withdrawal');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../config/email');

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private (Creator)
exports.createWithdrawal = asyncHandler(async (req, res) => {
  const {
    amount,
    bankDetails,
    pan
  } = req.body;

  // Validate campaign exists and user is creator
  const campaign = await Campaign.findOne({
    _id: req.body.campaignId,
    creator: req.user._id
  });

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check available balance
  if (campaign.availableBalance < amount) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient balance',
      available: campaign.availableBalance
    });
  }

  // Validate bank details
  const { accountNumber, accountHolderName, ifsc, bankName, branchName } = bankDetails;

  if (!accountNumber || !accountHolderName || !ifsc) {
    return res.status(400).json({
      success: false,
      message: 'Complete bank details are required'
    });
  }

  // Create withdrawal request
  const withdrawal = await Withdrawal.create({
    campaign: campaign._id,
    campaignTitle: campaign.title,
    creator: req.user._id,
    creatorName: req.user.fullName,
    amount: parseFloat(amount),
    bankDetails: {
      accountNumber,
      accountHolderName,
      ifsc,
      bankName: bankName || '',
      branchName: branchName || '',
      pan: pan || ''
    }
  });

  // Deduct from available balance
  await Campaign.findByIdAndUpdate(campaign._id, {
    $inc: { availableBalance: -amount }
  });

  res.status(201).json({
    success: true,
    message: 'Withdrawal request created successfully',
    data: withdrawal
  });
});

// @desc    Get user's withdrawal requests
// @route   GET /api/withdrawals/my-withdrawals
// @access  Private (Creator)
exports.getMyWithdrawals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { creator: req.user._id };
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(query)
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

// @desc    Get single withdrawal request
// @route   GET /api/withdrawals/:id
// @access  Private (Campaign creator / Admin)
exports.getWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const withdrawal = await Withdrawal.findById(id)
    .populate('creator', 'fullName email')
    .populate('approvedBy', 'fullName')
    .populate('campaign', 'title slug');

  if (!withdrawal) {
    return res.status(404).json({
      success: false,
      message: 'Withdrawal request not found'
    });
  }

  // Check authorization
  const isOwner = withdrawal.creator._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  res.status(200).json({
    success: true,
    data: withdrawal
  });
});

// @desc    Cancel withdrawal request
// @route   PUT /api/withdrawals/:id/cancel
// @access  Private (Campaign creator)
exports.cancelWithdrawal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const withdrawal = await Withdrawal.findById(id);

  if (!withdrawal) {
    return res.status(404).json({
      success: false,
      message: 'Withdrawal request not found'
    });
  }

  if (withdrawal.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (!['pending', 'processing'].includes(withdrawal.status)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel a processed withdrawal'
    });
  }

  withdrawal.status = 'cancelled';
  withdrawal.cancelledAt = new Date();
  withdrawal.cancellationReason = req.body.reason || 'Cancelled by creator';
  withdrawal.cancelledBy = req.user._id;

  await withdrawal.save();

  // Refund to campaign balance
  await Campaign.findByIdAndUpdate(withdrawal.campaign, {
    $inc: { availableBalance: withdrawal.amount }
  });

  res.status(200).json({
    success: true,
    message: 'Withdrawal cancelled successfully',
    data: withdrawal
  });
});

// @desc    Verify bank account (simulate micro-deposit or instant verification)
// @route   POST /api/withdrawals/verify-bank
// @access  Private
exports.verifyBankAccount = asyncHandler(async (req, res) => {
  const { accountNumber, ifsc } = req.body;

  // This would integrate with a bank verification API
  // For now, return success with basic validation
  if (!accountNumber || !ifsc) {
    return res.status(400).json({
      success: false,
      message: 'Account number and IFSC are required'
    });
  }

  // Basic IFSC format validation
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(ifsc)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid IFSC code'
    });
  }

  // In production, you'd call:
  // 1. Razorpay's account validation API
  // 2. Or a third-party service like Pinga, Finmo, etc.

  res.status(200).json({
    success: true,
    message: 'Account validation successful',
    data: {
      isValid: true,
      bankName: 'Bank Name' // Would come from API
    }
  });
});

// @desc    Get withdrawal statistics
// @route   GET /api/withdrawals/stats
// @access  Private (Campaign creator)
exports.getWithdrawalStats = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ creator: req.user._id });

  const stats = {
    totalRaised: 0,
    totalWithdrawn: 0,
    availableBalance: 0,
    pendingWithdrawals: 0,
    campaigns: []
  };

  for (const campaign of campaigns) {
    const withdrawals = await Withdrawal.find({
      campaign: campaign._id,
      status: { $in: ['pending', 'processing'] }
    });

    stats.totalRaised += campaign.amountRaised;
    stats.totalWithdrawn += campaign.totalWithdrawn;
    stats.availableBalance += campaign.availableBalance;
    stats.pendingWithdrawals += withdrawals.reduce((sum, w) => sum + w.amount, 0);

    stats.campaigns.push({
      campaignId: campaign._id,
      title: campaign.title,
      raised: campaign.amountRaised,
      withdrawn: campaign.totalWithdrawn,
      available: campaign.availableBalance,
      pending: withdrawals.map(w => ({
        id: w._id,
        amount: w.amount,
        status: w.status,
        requestedAt: w.createdAt
      }))
    });
  }

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = exports;
