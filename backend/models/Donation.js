const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  donorName: {
    type: String,
    trim: true
  },
  donorEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  campaignTitle: String, // Denormalized

  // Payment Details
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: String,
  razorpaySignature: String,
  receipt: String,

  amount: {
    type: Number,
    required: [true, 'Donation amount is required'],
    min: [1, 'Minimum donation is ₹1']
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Donation Options
  isAnonymous: {
    type: Boolean,
    default: false
  },
  dedicatedTo: String, // Dedication message
  message: String, // Support message
  hideAmount: {
    type: Boolean,
    default: false
  },

  // Payment Status
  paymentStatus: {
    type: String,
    enum: ['pending', 'captured', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    default: 'card'
  },
  paymentGateway: {
    type: String,
    default: 'razorpay'
  },

  // Metadata
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  },

  // Receipt
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptNumber: String

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
donationSchema.index({ donor: 1 });
donationSchema.index({ campaign: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ razorpayOrderId: 1 });
donationSchema.index({ razorpayPaymentId: 1 });

// Compound indexes
donationSchema.index({ campaign: 1, paymentStatus: 1 });
donationSchema.index({ donor: 1, createdAt: -1 });

// Pre-save middleware to set donorName and donorEmail
donationSchema.pre('save', function(next) {
  if (this.isNew && this.donor && !this.donorName) {
    // We'll populate after saving, so just set a placeholder
    this.donorName = 'Anonymous';
  }
  next();
});

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(this.amount);
});

module.exports = mongoose.model('Donation', donationSchema);
