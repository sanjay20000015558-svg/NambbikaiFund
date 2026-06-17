const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit mobile number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },

  // Profile
  profilePicture: {
    type: {
      url: { type: String },
      publicId: { type: String }
    },
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    default: 'prefer-not-to-say'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    pincode: String
  },
  governmentId: {
    type: String,
    trim: true
  },
  governmentIdImage: {
    type: String
  },

// Preferences
   language: {
     type: String,
     enum: [
       'en', 'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur',
       'or', 'as', 'kok', 'ne', 'si', 'ar', 'fa', 'he',
       'zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id', 'ms', 'fil',
       'es', 'fr', 'de', 'it', 'pt', 'nl', 'ru', 'pl', 'ro', 'el', 'tr',
       'sv', 'no', 'fi', 'da', 'cs', 'hu', 'hr', 'sr', 'sk', 'uk',
       'am', 'sw', 'yo', 'zu', 'af'
     ],
     default: 'en'
   },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },

  // Account Status
  role: {
    type: String,
    enum: ['donor', 'creator', 'admin', 'verifier'],
    default: 'donor'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Activity tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Statistics
  totalDonations: {
    type: Number,
    default: 0,
    min: 0
  },
  campaignsCreated: {
    type: Number,
    default: 0,
    min: 0
  },

  // Ban status
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: String,
  bannedAt: Date,
  bannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ mobileNumber: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ 'address.state': 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Virtual for campaign count
userSchema.virtual('campaigns', {
  ref: 'Campaign',
  localField: '_id',
  foreignField: 'creator',
  justOne: false
});

// Prevent JSON output of password
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
