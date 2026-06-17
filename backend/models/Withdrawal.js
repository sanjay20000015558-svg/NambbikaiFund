const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  campaignTitle: String, // Denormalized
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: String,

  // Requested amount and currency
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [100, 'Minimum withdrawal amount is ₹100']
  },
  currency: {
    type: String,
    default: 'INR'
  },

  // Bank Details (encrypted ideally, kept simple for now)
  bankDetails: {
    accountNumber: {
      type: String,
      required: [true, 'Account number is required']
    },
    accountHolderName: {
      type: String,
      required: [true, 'Account holder name is required']
    },
    ifsc: {
      type: String,
      required: [true, 'IFSC code is required'],
      uppercase: true
    },
    bankName: String,
    branchName: String,
    pan: String // Optional PAN for tax purposes
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'approved', 'paid', 'rejected', 'cancelled'],
    default: 'pending'
  },

  // Approval Details
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,

  // Payment Details
  paymentDetails: {
    transactionId: String,
    paymentMode: String, // NEFT, IMPS, RTGS, etc.
    paymentDate: Date,
    utr: String // Unique Transaction Reference
  },

  // Tax Deduction at Source (TDS)
  tdsApplicable: {
    type: Boolean,
    default: false
  },
  tdsAmount: {
    type: Number,
    default: 0
  },
  netAmount: Number, // amount - tds

  // Notes
  adminNotes: String,
  creatorNotes: String,

  // Cancellation
  cancelledAt: Date,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
withdrawalSchema.index({ campaign: 1 });
withdrawalSchema.index({ creator: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ createdAt: -1 });
withdrawalSchema.index({ 'bankDetails.ifsc': 1 });

// Compound indexes
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ creator: 1, status: 1 });

// Virtual for formatted amount
withdrawalSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(this.amount);
});

// Virtual for net amount after TDS
withdrawalSchema.virtual('netAmountCalculated').get(function() {
  if (!this.tdsApplicable) return this.amount;
  return this.amount - (this.tdsAmount || 0);
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
