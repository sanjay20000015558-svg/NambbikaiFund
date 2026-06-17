const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  webhook,
  getMyDonations,
  getCampaignDonations,
  getDonation,
  requestRefund
} = require('../controllers/donationController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { donationValidation, objectIdValidation, validate } = require('../validators');
const asyncHandler = require('../middlewares/asyncHandler');

// Create payment order (for frontend)
router.post('/create-order', createOrder);

// Verify payment and capture donation
router.post('/verify', verifyPayment);

// Razorpay webhook (must be before protect middleware)
router.post('/webhook', webhook);

// Get my donations
router.get('/my-donations', protect, getMyDonations);

// Get campaign donations (owner only)
router.get('/campaign/:campaignId', protect, getCampaignDonations);

// Get single donation
router.get('/:id', protect, getDonation);

// Request refund
router.post('/:id/refund', protect, requestRefund);

module.exports = router;
