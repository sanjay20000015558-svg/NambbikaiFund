const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  // Campaign Basic Info
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    minlength: [10, 'Title must be at least 10 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  category: {
    type: String,
    enum: {
      values: [
        'leukemia',
        'medical',
        'education',
        'startup',
        'agriculture',
        'emergency',
        'social-cause'
      ],
      message: 'Please select a valid category'
    },
    required: [true, 'Category is required']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  description: {
    type: String,
    required: [true, 'Detailed story is required'],
    minlength: [200, 'Story must be at least 200 characters']
  },

  // Financial Details
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [1000, 'Minimum target amount is ₹1,000'],
    max: [100000000, 'Maximum target amount is ₹10 Crore']
  },
  amountRaised: {
    type: Number,
    default: 0,
    min: 0
  },
  donorsCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Urgency
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isUrgent: {
    type: Boolean,
    default: false
  },

  // Timeline
  deadline: {
    type: Date,
    required: [true, 'Campaign deadline is required']
  },

  // Creator Info (redundant but denormalized for quick access)
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorName: String, // Denormalized for quick display
  creatorMobile: String,
  creatorEmail: String,

  // Patient Details (if different from creator)
  patientDetails: {
    name: String,
    age: Number,
    gender: String,
    relationship: String // relationship with creator
  },

  // Category-specific fields
  medicalDetails: {
    hospitalName: String,
    doctorName: String,
    diagnosis: String,
    treatmentPlan: String,
    hospitalEstimate: {
      fileUrl: String,
      fileName: String
    }
  },
  educationDetails: {
    institutionName: String,
    courseName: String,
    academicYear: String,
    reasonForNeed: String
  },
  startupDetails: {
    businessIdea: String,
    businessPlan: {
      fileUrl: String,
      fileName: String
    },
    marketPotential: String,
    expectedGrowth: String
  },
  agricultureDetails: {
    farmSize: String,
    cropType: String,
    lossReason: String,
    requiredSupport: String
  },
  emergencyDetails: {
    emergencyType: String,
    description: String,
    immediateNeed: String
  },
  socialCauseDetails: {
    causeType: String,
    beneficiaries: String,
    impactDescription: String
  },

  // Media
  coverImage: {
    url: String,
    publicId: String
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  videos: [{
    url: String,
    publicId: String,
    thumbnail: String
  }],
  supportingDocuments: [String],

  // Location
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'India' }
  },

// Verification Status
   status: {
     type: String,
     enum: ['draft', 'submitted', 'pending', 'approved', 'rejected', 'live', 'closed', 'suspended'],
     default: 'pending'
   },
   verificationNotes: [{
     note: String,
     addedBy: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'User'
     },
     addedAt: {
       type: Date,
       default: Date.now
     }
   }],
   reviewedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   reviewedAt: Date,
   verifiedBy: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User'
   },
   verifiedAt: Date,

  // Payout
  bankDetails: {
    accountNumber: String,
    accountHolderName: String,
    ifsc: String,
    bankName: String,
    branchName: String,
    pan: String
  },
  withdrawalRequests: [{
    amount: Number,
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    paidAt: Date,
    transactionId: String,
    notes: String
  }],
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },

  // Campaign Updates
  updates: [{
    title: String,
    content: String,
    media: [{
      url: String,
      publicId: String
    }],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    postedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comments/Discussions
  comments: [{
    text: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    authorName: String, // Denormalized
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Campaign visibility and flags
  isVisible: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],

  // SEO fields
  metaTitle: String,
  metaDescription: String,

  // Engagement metrics
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    default: 0,
    min: 0
  },

  // Fraud detection
  isFlagged: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: Date,

  // Language
  originalLanguage: {
    type: String,
    default: 'en'
  },
  availableLanguages: [{
    type: String
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
campaignSchema.index({ creator: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ city: 1, state: 1 });
campaignSchema.index({ deadline: 1 });
campaignSchema.index({ amountRaised: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ isUrgent: -1 });
campaignSchema.index({ isFeatured: -1 });
campaignSchema.index({ isVisible: 1, status: 1 });
campaignSchema.index({ title: 'text', description: 'text', shortDescription: 'text' });

// Compound indexes for common queries
campaignSchema.index({ category: 1, status: 1, createdAt: -1 });
campaignSchema.index({ status: 1, deadline: 1 });
campaignSchema.index({ status: 1, isFeatured: -1 });

// Virtual for campaign progress percentage
campaignSchema.virtual('progress').get(function() {
  return this.targetAmount > 0
    ? Math.min(100, Math.round((this.amountRaised / this.targetAmount) * 100))
    : 0;
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
  if (!this.deadline) return 0;
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for isExpired
campaignSchema.virtual('isExpired').get(function() {
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

// Pre-save middleware to generate slug
campaignSchema.pre('save', function(next) {
  if (this.isModified('title') || this.isNew) {
    // Generate slug from title
    const slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36).slice(-6);
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
