const mongoose = require('mongoose');

const campaignTranslationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  language: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  story: {
    type: String,
    required: true
  },
  patientName: String,
  hospitalName: String,
  diagnosis: String,
  treatment: String,
  budget: String,
  location: {
    city: String,
    state: String,
    country: String
  },
  translations: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
campaignTranslationSchema.index({ campaign: 1, language: 1 }, { unique: true });

// Static method to get translation or fallback
campaignTranslationSchema.statics.getTranslation = async function(campaignId, language, fallbackLng = 'en') {
  const translation = await this.findOne({ campaign: campaignId, language });
  if (translation) {
    return translation;
  }
  
  // Try fallback language
  if (fallbackLng !== language) {
    const fallback = await this.findOne({ campaign: campaignId, language: fallbackLng });
    if (fallback) {
      return fallback;
    }
  }
  
  // Return original campaign (stored in original language)
  const Campaign = mongoose.model('Campaign');
  const campaign = await Campaign.findById(campaignId);
  if (campaign) {
    return {
      language: fallbackLng,
      title: campaign.title,
      story: campaign.description,
      patientName: campaign.patientName,
      hospitalName: campaign.hospitalName,
      diagnosis: campaign.medicalDetails?.diagnosis,
      treatment: campaign.medicalDetails?.treatment,
      budget: campaign.targetAmount ? `₹${campaign.targetAmount}` : null,
      location: campaign.location
    };
  }
  
  return null;
};

// Method to check if translation is complete
campaignTranslationSchema.methods.getTranslationCoverage = function() {
  const requiredFields = ['title', 'story', 'patientName', 'hospitalName'];
  const translatedFields = requiredFields.filter(field => this[field]);
  return {
    percentage: Math.round((translatedFields.length / requiredFields.length) * 100),
    missingKeys: requiredFields.filter(field => !this[field])
  };
};

module.exports = mongoose.model('CampaignTranslation', campaignTranslationSchema);