const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createOrder, verifyPaymentSignature, verifyWebhookSignature, createRefund } = require('../config/razorpay');
const { sendEmail, emailTemplates } = require('../config/email');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Create Razorpay order for donation
// @route   POST /api/donations/create-order
// @access  Public
exports.createOrder = asyncHandler(async (req, res) => {
  const { campaignId, amount, isAnonymous = false, dedicatedTo, message } = req.body;

  if (!mongoose.Types.ObjectId.isValid(campaignId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid campaign ID'
    });
  }

  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  if (campaign.status !== 'approved' && campaign.status !== 'live') {
    return res.status(400).json({
      success: false,
      message: 'Campaign is not accepting donations'
    });
  }

  if (!amount || amount < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid donation amount is required'
    });
  }

  // Generate receipt ID
  const receipt = `donation_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // Create Razorpay order
  const order = await createOrder({
    amount,
    receipt,
    notes: {
      campaignId,
      userId: req.user ? req.user._id : 'guest',
      isAnonymous: String(isAnonymous)
    }
  });

  // Create pending donation record
  const donation = await Donation.create({
    donor: req.user ? req.user._id : null,
    donorName: req.user ? req.user.fullName : 'Anonymous',
    donorEmail: req.user ? req.user.email : null,
    campaign: campaignId,
    campaignTitle: campaign.title,
    amount,
    currency: 'INR',
    isAnonymous,
    dedicatedTo: dedicatedTo || '',
    message: message || '',
    razorpayOrderId: order.id,
    paymentStatus: 'pending',
    receipt
  });

  res.status(200).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      campaign: {
        title: campaign.title,
        slug: campaign.slug
      },
      donationId: donation._id,
      donorName: req.user ? req.user.fullName : 'Anonymous Donor'
    }
  });
});

// @desc    Verify and capture payment (Webhook)
// @route   POST /api/donations/verify
// @access  Public (Webhook)
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  // Verify signature
  const isValidSignature = verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValidSignature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature'
    });
  }

  // Find donation by order ID
  const donation = await Donation.findOne({
    razorpayOrderId: razorpay_order_id
  });

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Donation record not found'
    });
  }

  // Donor info
  const donorName = req.body.donorName || donation.donorName;
  const donorEmail = req.body.donorEmail || donation.donorEmail;

  // Update donation
  donation.razorpayPaymentId = razorpay_payment_id;
  donation.razorpaySignature = razorpay_signature;
  donation.paymentStatus = 'captured';
  donation.paymentMethod = req.body.paymentMethod || 'card';

  if (req.user) {
    donation.donor = req.user._id;
  }

  await donation.save();

  // Update campaign stats
  await Campaign.findByIdAndUpdate(donation.campaign, {
    $inc: {
      amountRaised: donation.amount,
      donorsCount: 1
    }
  });

  // Update donor's total donations
  if (donation.donor) {
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { totalDonations: donation.amount }
    });
  }

  // Send notification to campaign creator
  const campaign = await Campaign.findById(donation.campaign);
  if (campaign && campaign.creator) {
    await Notification.create({
      recipient: campaign.creator,
      type: 'donation_received',
      title: '🎁 New Donation!',
      message: `You received ₹${donation.amount} from ${donorName}`,
      icon: '🎁',
      color: 'success',
      link: `/dashboard/campaigns/${campaign._id}`,
      relatedTo: {
        model: 'Donation',
        id: donation._id
      }
    });

    // Send email to creator
    if (campaign.creatorEmail) {
      try {
        await sendEmail({
          to: campaign.creatorEmail,
          ...emailTemplates.donationReceived(
            donorName,
            donation.amount,
            campaign.title
          )
        });
      } catch (emailErr) {
        console.error('Failed to send donation email:', emailErr.message);
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    data: {
      donationId: donation._id,
      amount: donation.amount
    }
  });
});

// @desc    Razorpay webhook handler
// @route   POST /api/donations/webhook
// @access  Public (Webhook - authenticated via secret)
exports.webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: 'Webhook signature missing'
    });
  }

  // Verify webhook signature
  const isValidSignature = verifyWebhookSignature(req.body, signature);

  if (!isValidSignature) {
    console.error('Invalid webhook signature');
    return res.status(400).json({
      success: false,
      message: 'Invalid signature'
    });
  }

  const event = req.body;

  // Handle different webhook events
  switch (event.event) {
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment);
      break;

    case 'refund.processed':
      await handleRefundProcessed(event.payload.refund);
      break;

    default:
      console.log(`Unhandled webhook event: ${event.event}`);
  }

  res.status(200).json({
    received: true
  });
});

async function handlePaymentCaptured(payment) {
  const { order_id, id: payment_id, amount, method } = payment;

  const donation = await Donation.findOne({
    razorpayOrderId: order_id
  });

  if (!donation) return;

  donation.razorpayPaymentId = payment_id;
  donation.paymentStatus = 'captured';
  donation.paymentMethod = method;
  donation.razorpaySignature = 'webhook'; // Set by webhook

  await donation.save();

  // Update campaign
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
  }
}

async function handlePaymentFailed(payment) {
  const { order_id } = payment;

  await Donation.findOneAndUpdate(
    { razorpayOrderId: order_id },
    { paymentStatus: 'failed' }
  );
}

async function handleRefundProcessed(refund) {
  const { payment_id, amount } = refund;

  await Donation.findOneAndUpdate(
    { razorpayPaymentId: payment_id },
    {
      paymentStatus: 'refunded'
    }
  );

  // Adjust campaign amount
  const donation = await Donation.findOne({ razorpayPaymentId: payment_id });
  if (donation) {
    await Campaign.findByIdAndUpdate(donation.campaign, {
      $inc: { amountRaised: -donation.amount, donorsCount: -1 }
    });
    await User.findByIdAndUpdate(donation.donor, {
      $inc: { totalDonations: -donation.amount }
    });
  }
}

// @desc    Get donor's donations
// @route   GET /api/donations/my-donations
// @access  Private
exports.getMyDonations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const donations = await Donation.find({ donor: req.user._id })
    .sort({ createdAt: -1 })
    .populate('campaign', 'title slug coverImage status')
    .skip((page - 1) * limit)
    .limit(limit);

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

// @desc    Get donations for a campaign
// @route   GET /api/donations/campaign/:campaignId
// @access  Private (Campaign owner/Admin)
exports.getCampaignDonations = asyncHandler(async (req, res) => {
  const { campaignId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check authorization (campaign owner or admin)
  const isOwner = campaign.creator.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'verifier';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view these donations'
    });
  }

  const donations = await Donation.find({ campaign: campaignId, paymentStatus: 'captured' })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  // Expose donor names based on anonymity preference
  const donationData = donations.map(d => ({
    id: d._id,
    amount: d.amount,
    donorName: d.isAnonymous ? 'Anonymous' : d.donorName,
    dedicatedTo: d.dedicatedTo || null,
    message: d.message || null,
    hideAmount: d.hideAmount,
    createdAt: d.createdAt,
    paymentMethod: d.paymentMethod
  }));

  const total = await Donation.countDocuments({
    campaign: campaignId,
    paymentStatus: 'captured'
  });

  res.status(200).json({
    success: true,
    count: donationData.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: donationData
  });
});

// @desc    Request refund
// @route   POST /api/donations/:id/refund
// @access  Private (Donor only)
exports.requestRefund = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const donation = await Donation.findById(id);

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Donation not found'
    });
  }

  // Check ownership
  if (donation.donor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  // Check if donation is eligible for refund (within 30 days)
  const daysSinceDonation = (Date.now() - new Date(donation.createdAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceDonation > 30) {
    return res.status(400).json({
      success: false,
      message: 'Refunds are only available within 30 days of donation'
    });
  }

  // Create refund
  const refund = await createRefund(donation.razorpayPaymentId, donation.amount);

  donation.paymentStatus = 'refunded';
  await donation.save();

  res.status(200).json({
    success: true,
    message: 'Refund initiated successfully',
    data: {
      refundId: refund.id,
      amount: refund.amount / 100, // Convert back to INR
      status: refund.status
    }
  });
});

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private (Donor/Campaign Creator/Admin)
exports.getDonation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const donation = await Donation.findById(id)
    .populate('donor', 'fullName')
    .populate('campaign', 'title slug');

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Donation not found'
    });
  }

  // Check authorization
  const isDonor = donation.donor && donation.donor._id.toString() === req.user._id.toString();
  const isCampaignOwner = donation.campaign && donation.campaign.creator &&
    donation.campaign.creator.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'verifier';

  if (!isDonor && !isCampaignOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this donation'
    });
  }

  res.status(200).json({
    success: true,
    data: donation
  });
});

module.exports = exports;