const asyncHandler = require('../middlewares/asyncHandler');
const razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/email');

// Initialize Razorpay
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Public
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, campaignId, currency = 'INR' } = req.body;

  if (!amount || !campaignId) {
    return res.status(400).json({
      success: false,
      message: 'Amount and campaign ID are required'
    });
  }

  // Verify campaign
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status !== 'live') {
    return res.status(404).json({
      success: false,
      message: 'Campaign not available for donations'
    });
  }

  // Create order options
  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency,
    receipt: `receipt_${Date.now()}`,
    notes: {
      campaignId,
      userId: req.user ? req.user._id : 'guest',
      purpose: 'donation'
    },
    payment_capture: 1
  };

  try {
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        amountInRupees: order.amount / 100,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
});

// @desc    Verify payment via webhook
// @route   POST /api/payments/verify
// @access  Public
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    donationId,
    donorName,
    donorEmail
  } = req.body;

  // Verify Razorpay signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature'
    });
  }

  let donation;

  if (donationId) {
    // Update existing donation
    donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation record not found'
      });
    }
  } else {
    // Find by order ID
    donation = await Donation.findOne({ razorpayOrderId: razorpay_order_id });
    if (!donation) {
      // Create new donation record if not found
      const order = await razorpayInstance.orders.fetch(razorpay_order_id);
      donation = await Donation.create({
        donor: req.user ? req.user._id : null,
        donorName: donorName || 'Anonymous',
        donorEmail: donorEmail,
        campaign: order.notes.campaignId,
        campaignTitle: order.notes.campaignTitle,
        amount: order.amount / 100,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature,
        paymentStatus: 'captured'
      });
    } else {
      donation.razorpayPaymentId = razorpay_payment_id;
      donation.paymentStatus = 'captured';
    }
  }

  // Update donation
  await donation.save();

  // Update campaign stats
  await Campaign.findByIdAndUpdate(donation.campaign, {
    $inc: {
      amountRaised: donation.amount,
      donorsCount: 1
    }
  });

  // Update donor stats
  if (donation.donor) {
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { totalDonations: donation.amount }
    });

    // Create notification
    await Notification.create({
      recipient: donation.donor,
      type: 'donation_received',
      title: '🎁 Thank You!',
      message: `Your donation of ₹${donation.amount} to "${donation.campaignTitle}" was successful`,
      icon: '🎁',
      color: 'success',
      link: `/campaign/${donation.campaign}`,
      relatedTo: {
        model: 'Donation',
        id: donation._id
      }
    });
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      donationId: donation._id,
      amount: donation.amount,
      campaignId: donation.campaign
    }
  });
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
exports.getPaymentMethods = asyncHandler(async (req, res) => {
  // Could fetch from Razorpay or return static list
  const methods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', available: true },
    { id: 'upi', name: 'UPI', icon: '📱', available: true },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦', available: true },
    { id: 'wallet', name: 'Wallets', icon: '👛', available: true }
  ];

  res.status(200).json({
    success: true,
    data: methods
  });
});

// @desc    Get transaction history (admin)
// @route   GET /api/payments/transactions
// @access  Private (Admin)
exports.getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, paymentStatus, startDate, endDate } = req.query;

  const query = {};
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Donation.find(query)
      .populate('donor', 'fullName email')
      .populate('campaign', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Donation.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: transactions
  });
});

// @desc    Get specific transaction by ID
// @route   GET /api/payments/transactions/:id
// @access  Private (Admin or Donor)
exports.getTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const transaction = await Donation.findById(id)
    .populate('donor', 'fullName email')
    .populate('campaign', 'title slug')
    .populate('campaign.creator', 'fullName');

  if (!transaction) {
    return res.status(404).json({
      success: false,
      message: 'Transaction not found'
    });
  }

  // Check authorization
  const isDonor = transaction.donor && transaction.donor._id.toString() === req.user._id.toString();
  const isCampaignCreator = transaction.campaign.creator &&
    transaction.campaign.creator._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'verifier';

  if (!isDonor && !isCampaignCreator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this transaction'
    });
  }

  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Refund payment
// @route   POST /api/payments/refund/:id
// @access  Private (Admin)
exports.refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const donation = await Donation.findById(id);

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Donation not found'
    });
  }

  if (donation.paymentStatus !== 'captured') {
    return res.status(400).json({
      success: false,
      message: 'Only captured payments can be refunded'
    });
  }

  const refundAmount = amount || donation.amount;

  try {
    const refund = await razorpayInstance.refunds.create({
      payment_id: donation.razorpayPaymentId,
      amount: refundAmount * 100,
      notes: { reason: reason || 'Refund requested' }
    });

    // Update donation record
    donation.paymentStatus = 'refunded';
    await donation.save();

    // Adjust campaign stats
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: {
        amountRaised: -donation.amount,
        donorsCount: -1
      }
    });

    // Adjust donor stats
    if (donation.donor) {
      await User.findByIdAndUpdate(donation.donor, {
        $inc: { totalDonations: -donation.amount }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
});

// @desc    Get Razorpay payment link for campaign
// @route   POST /api/payments/create-link
// @access  Private (Creator)
exports.createPaymentLink = asyncHandler(async (req, res) => {
  const { campaignId, amount, description } = req.body;

  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  try {
    const paymentLink = await razorpayInstance.invoice.create({
      type: 'donation',
      amount: amount * 100,
      currency: 'INR',
      description: description || `Support ${campaign.title}`,
      customer: {
        name: req.user.fullName,
        email: req.user.email,
        contact: req.user.mobileNumber
      },
      notify: {
        sms: true,
        email: true
      },
      remind_enable: true,
      notes: {
        campaignId,
        userId: req.user._id
      }
    });

    res.status(200).json({
      success: true,
      data: {
        paymentLinkId: paymentLink.id,
        shortUrl: paymentLink.short_url,
        amount: paymentLink.amount,
        currency: paymentLink.currency
      }
    });

  } catch (error) {
    console.error('Payment link error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment link'
    });
  }
});

module.exports = exports;
