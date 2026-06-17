const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'campaign_approved',
      'campaign_rejected',
      'campaign_live',
      'donation_received',
      'donation_failed',
      'withdrawal_approved',
      'withdrawal_paid',
      'withdrawal_rejected',
      'verification_required',
      'account_verified',
      'password_changed',
      'new_message',
      'system',
      'admin'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  icon: String, // emoji or icon class
  color: String, // notification color theme
  link: String, // URL to redirect to
  actionLabel: String, // Button text

  // Related entities
  relatedTo: {
    model: {
      type: String,
      enum: ['Campaign', 'Donation', 'Withdrawal', 'User']
    },
    id: mongoose.Schema.Types.ObjectId
  },

  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Delivery tracking
  deliveryMethod: {
    type: String,
    enum: ['in-app', 'email', 'both'],
    default: 'both'
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ priority: -1 });
notificationSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

// Compound index
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// Scheme method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Scope: unread notifications for a user
notificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({
    recipient: userId,
    isRead: false
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Notification', notificationSchema);
