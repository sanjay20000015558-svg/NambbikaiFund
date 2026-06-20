const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const asyncHandler = require('../middlewares/asyncHandler');

// @desc    Get all campaigns (with filters)
// @route   GET /api/campaigns
// @access  Public
// Get all campaigns (public) - only show approved campaigns
exports.getCampaigns = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, status, search, sortBy = 'createdAt', order = 'desc', isUrgent, isFeatured, leukemia, city, state } = req.query;

  const query = { status: 'approved', isVisible: true };

  // Allow filtering by status if explicitly provided (for admin use)
  if (status) {
    if (Array.isArray(status)) {
      query.status = { $in: status };
    } else {
      query.status = status;
    }
  }

  // Filter by category
  if (category) {
    if (Array.isArray(category)) {
      query.category = { $in: category };
    } else {
      query.category = category;
    }
  }

  // Filter by location
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');

  // Urgent campaigns
  if (isUrgent === 'true') query.isUrgent = true;

  // Featured campaigns
  if (isFeatured === 'true') query.isFeatured = true;

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Build sort option
  const sortOption = {};
  sortOption[sortBy] = order === 'asc' ? 1 : -1;

  // For text search, add score
  if (search) {
    sortOption.score = { $meta: 'textScore' };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [campaigns, total] = await Promise.all([
    Campaign.find(query)
      .populate('creator', 'fullName profilePicture isVerified')
      .populate('verifiedBy', 'fullName')
      .select('-verificationNotes')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Campaign.countDocuments(query)
  ]);

  // Calculate pagination
  const pages = Math.ceil(total / parseInt(limit));

  // Enhance campaigns with computed fields
  const enhancedCampaigns = campaigns.map(campaign => ({
    ...campaign,
    progress: Math.round((campaign.amountRaised / campaign.targetAmount) * 100),
    daysRemaining: Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
  }));

  res.status(200).json({
    success: true,
    count: campaigns.length,
    total,
    page: parseInt(page),
    pages,
    data: enhancedCampaigns
  });
});

// @desc    Get single campaign by ID or slug
// @route   GET /api/campaigns/:id
// @access  Public
exports.getCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let query = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query._id = id;
  } else {
    query.slug = id;
  }

  const campaign = await Campaign.findOne(query)
    .populate('creator', 'fullName profilePicture isVerified totalDonations campaignsCreated')
    .populate('verifiedBy', 'fullName');

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

// Increment views
   await Campaign.findByIdAndUpdate(campaign._id, { $inc: { views: 1 } });

  // Enhance with computed fields
  campaign.progress = Math.round((campaign.amountRaised / campaign.targetAmount) * 100);
  campaign.daysRemaining = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private (Creator+)
exports.createCampaign = asyncHandler(async (req, res) => {
  console.log('Campaign request body:', JSON.stringify(req.body));
  console.log('Campaign request files:', req.files ? Object.keys(req.files) : 'none');

  // Parse JSON strings back to objects (FormData sends nested objects as strings)
  const body = {};
  for (let [key, value] of Object.entries(req.body)) {
    body[key] = typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))
      ? JSON.parse(value)
      : value;
  }

  console.log('[CREATE] Parsed body keys:', Object.keys(body));

  const {
    title,
    category,
    shortDescription,
    description,
    targetAmount,
    deadline,
    urgency,
    patientDetails,
    medicalDetails,
    educationDetails,
    location,
    isUrgent = false
  } = body;

  // Map fields with fallbacks for frontend compatibility
  const campaignData = {
    title: title || body.campaignTitle,
    category: category,
    shortDescription: shortDescription || body.shortDesc,
    description: description || body.story,
    targetAmount: targetAmount !== undefined ? Number(targetAmount) : (body.amount ? Number(body.amount) : undefined),
    deadline: deadline
  };

  console.log('[CREATE] Extracted campaignData:', campaignData);

  // Check if required fields are present
  const requiredFields = ['title', 'category', 'shortDescription', 'description', 'targetAmount', 'deadline'];
  const missingFields = requiredFields.filter(field => !campaignData[field]);

  if (missingFields.length > 0) {
    console.error('[CREATE] Missing required fields:', missingFields);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`,
      missingFields
    });
  }

  // Check if deadline is in future
  if (new Date(campaignData.deadline) <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Deadline must be in the future'
    });
  }

  // Check target amount
  if (campaignData.targetAmount < 1000 || campaignData.targetAmount > 100000000) {
    return res.status(400).json({
      success: false,
      message: 'Target amount must be between ₹1,000 and ₹10 Crore'
    });
  }

  // Prepare campaign data
const campaignPayload = {
     ...campaignData,
     urgency: urgency || 'medium',
     isUrgent,
     creator: req.user._id,
     creatorName: req.user.fullName,
     creatorEmail: req.user.email,
     creatorMobile: req.user.mobileNumber,
     patientDetails: body.patientDetails || undefined,
     medicalDetails: body.medicalDetails || undefined,
     educationDetails: body.educationDetails || undefined,
     location: body.location || undefined,
     status: 'pending'
   };

  console.log('BODY =', body);
  console.log('FILES =', req.files);
  console.log('PAYLOAD BEFORE FILES =', campaignPayload);
  console.log('[CREATE] educationDetails included:', !!campaignPayload.educationDetails, campaignPayload.educationDetails);
  console.log('[CREATE] All category details:');
  console.log('  patientDetails:', !!campaignPayload.patientDetails);
  console.log('  medicalDetails:', !!campaignPayload.medicalDetails);
  console.log('  educationDetails:', !!campaignPayload.educationDetails);
  console.log('  location:', !!campaignPayload.location);

  // Handle cover image from Cloudinary (already uploaded by multer)
  if (req.files?.coverImage?.[0]) {
    const file = req.files.coverImage[0];
    campaignPayload.coverImage = {
      url: file.secure_url || file.path,
      publicId: file.public_id || file.filename
    };
  }

  // Handle additional images from Cloudinary (already uploaded by multer)
  if (req.files?.images?.length) {
    campaignPayload.images = req.files.images.map(file => ({
      url: file.secure_url || file.path,
      publicId: file.public_id || file.filename
    }));
  }

  // Handle supporting documents from Cloudinary (already uploaded by multer)
  if (req.files?.documents?.length) {
    campaignPayload.supportingDocuments = req.files.documents.map(file => ({
      name: file.originalname,
      url: file.secure_url || file.path,
      publicId: file.public_id || file.filename,
      type: file.mimetype
    }));
  }

  // Guard: never let a malformed supportingDocuments reach Mongoose
  // If req.body carried a legacy/invalid value, overwrite it here
  if (req.body?.supportingDocuments && !campaignPayload.supportingDocuments) {
    try {
      const parsed = typeof req.body.supportingDocuments === 'string'
        ? JSON.parse(req.body.supportingDocuments)
        : req.body.supportingDocuments;
      if (Array.isArray(parsed) && parsed.every(d => d && typeof d.publicId === 'string')) {
        campaignPayload.supportingDocuments = parsed;
      }
    } catch (_) { /* ignore malformed body value */ }
  }

  console.log("===================================");
  console.log("[CREATE] FINAL campaignPayload.supportingDocuments =", campaignPayload.supportingDocuments);
  console.log("[CREATE] FINAL typeof supportingDocuments =", typeof campaignPayload.supportingDocuments);
  console.log("[CREATE] FINAL req.files.documents =", req.files?.documents);
  console.log("[CREATE] FINAL req.body =", req.body);
  console.log("===================================");

  // Extract document URLs only (schema is [String])
  const fileDocuments = (req.files?.documents || []).map(file => String(file.secure_url || file.path || ''));

  // Completely remove supportingDocuments from create payload — add after save
  if (campaignPayload.supportingDocuments) {
    delete campaignPayload.supportingDocuments;
  }

  // Also strip any other potentially-mutated fields and rebuild clean
  if (typeof campaignPayload.isUrgent === 'string') {
    campaignPayload.isUrgent = campaignPayload.isUrgent === 'true';
  }
  if (typeof campaignPayload.targetAmount === 'string') {
    campaignPayload.targetAmount = Number(campaignPayload.targetAmount);
  }

  // Deep-clone to guarantee no prototype pollution or getter mutations
  const cleanPayload = JSON.parse(JSON.stringify(campaignPayload));

  console.log("[CREATE] cleanPayload keys:", Object.keys(cleanPayload));
  console.log("[CREATE] supportingDocuments excluded from create:", !('supportingDocuments' in cleanPayload));

  let campaign;
  try {
    campaign = await Campaign.create(cleanPayload);
  } catch (error) {
    console.error("Campaign Creation Error:", error);
    console.error("Validation Errors:", error.errors);
    return res.status(400).json({
      success: false,
      message: error.message,
      errors: error.errors
    });
  }

  // Attach supportingDocuments after campaign exists using raw $set to bypass Mongoose setter bug
  if (fileDocuments.length > 0) {
    await Campaign.findByIdAndUpdate(campaign._id, {
      $set: { supportingDocuments: fileDocuments }
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $inc: { campaignsCreated: 1 }
  });

  // Auto-translate campaign to all languages
  const { translateCampaign } = require('../services/translationService');
  const supportedLanguages = [
    'hi', 'ta', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur',
    'ar', 'es', 'fr', 'de', 'zh-CN', 'ja'
  ];
  
  // Trigger translation in background (don't wait)
  translateCampaign(campaign, supportedLanguages.slice(0, 5)).catch(err => {
    console.error('Auto-translation error:', err);
  });

  return res.status(201).json({
    success: true,
    message: 'Campaign submitted successfully. Waiting for admin approval.',
    data: campaign
  });
});

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private (Owner only)
exports.updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let updateFields = { ...req.body };

  // supportingDocuments comes ONLY from file uploads, never from req.body
  // (FormData JSON strings with single quotes or other formats fail JSON.parse
  //  and would cause Mongoose CastError if allowed through)
  delete updateFields.supportingDocuments;

  // Parse JSON strings for nested objects
  for (let [key, value] of Object.entries(updateFields)) {
    if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
      updateFields[key] = JSON.parse(value);
    }
  }

  // Remove fields that shouldn't be updated directly
  delete updateFields._id;
  delete updateFields.creator;
  delete updateFields.status;
  delete updateFields.amountRaised;
  delete updateFields.donorsCount;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check ownership or admin
  const isOwner = campaign.creator.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'verifier';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this campaign'
    });
  }

  // Only allow editing if campaign is not live yet
  if (campaign.status === 'live' && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot edit a live campaign. Please contact support.'
    });
  }

  // Handle new file uploads
  if (req.files) {
    if (req.files.coverImage) {
      if (campaign.coverImage?.publicId) {
        await deleteFromCloudinary(campaign.coverImage.publicId);
      }
      const upload = await uploadToCloudinary(req.files.coverImage[0].path, 'campaigns/cover');
      updateFields.coverImage = {
        url: upload.secure_url,
        publicId: upload.public_id
      };
    }

    if (req.files.images) {
      if (campaign.images?.length) {
        await Promise.all(
          campaign.images.map(img => deleteFromCloudinary(img.publicId))
        );
      }
      const uploads = await Promise.all(
        req.files.images.map(file => uploadToCloudinary(file.path, 'campaigns/images'))
      );
      updateFields.images = uploads.map(u => ({ url: u.secure_url, publicId: u.public_id }));
    }

    if (req.files.documents) {
      const newDocUploads = await Promise.all(
        req.files.documents.map(file => uploadToCloudinary(file.path, 'campaigns/documents'))
      );
      const newDocs = newDocUploads.map((u, i) => ({
        name: req.files.documents[i].originalname,
        url: u.secure_url,
        publicId: u.public_id,
        type: req.files.documents[i].mimetype
      }));

      const existingDocs = updateFields.supportingDocuments || [];
      updateFields.supportingDocuments = [...existingDocs, ...newDocs];
    }
  }

  // Guard: never let a malformed supportingDocuments reach Mongoose
  if (typeof updateFields.supportingDocuments === 'string') {
    try {
      const parsed = JSON.parse(updateFields.supportingDocuments);
      updateFields.supportingDocuments = Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      updateFields.supportingDocuments = [];
    }
  } else if (!Array.isArray(updateFields.supportingDocuments)) {
    updateFields.supportingDocuments = [];
  } else {
    // Filter out any non-object entries (strings, numbers, etc.)
    updateFields.supportingDocuments = updateFields.supportingDocuments.filter(
      doc => doc && typeof doc === 'object' && !Array.isArray(doc)
    );
  }

  // Check for removed documents and archive their Cloudinary files
  if (campaign.supportingDocuments && updateFields.supportingDocuments) {
    const oldPublicIds = new Set(
      campaign.supportingDocuments.map(d => d.publicId).filter(Boolean)
    );
    const newPublicIds = new Set(
      updateFields.supportingDocuments.map(d => d.publicId).filter(Boolean)
    );
    const removedIds = [...oldPublicIds].filter(id => !newPublicIds.has(id));

    for (const publicId of removedIds) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (err) {
        console.error('Failed to delete old document from Cloudinary:', publicId, err.message);
      }
    }
  }

  // Update campaign
  Object.assign(campaign, updateFields);
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Campaign updated successfully',
    data: campaign
  });
});

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private (Owner/Admin)
exports.deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Check ownership or admin
  const isOwner = campaign.creator.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin' || req.user.role === 'verifier';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this campaign'
    });
  }

  // Only allow deletion if campaign has no donations
  if (campaign.amountRaised > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete campaign with donations. Please contact support.'
    });
  }

  // Delete all media from cloudinary
  if (campaign.coverImage?.publicId) {
    await deleteFromCloudinary(campaign.coverImage.publicId);
  }
  if (campaign.images) {
    await Promise.all(
      campaign.images.map(img => deleteFromCloudinary(img.publicId))
    );
  }
  if (campaign.supportingDocuments) {
    await Promise.all(
      campaign.supportingDocuments.map(doc => deleteFromCloudinary(doc.publicId))
    );
  }

  await campaign.deleteOne();

  // Update user's campaign count
  await User.findByIdAndUpdate(campaign.creator, { $inc: { campaignsCreated: -1 } });

  res.status(200).json({
    success: true,
    message: 'Campaign deleted successfully'
  });
});

// @desc    Close campaign
// @route   PUT /api/campaigns/:id/close
// @access  Private (Campaign creator)
exports.closeCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  if (campaign.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  campaign.status = 'closed';
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Campaign closed successfully',
    data: campaign
  });
});

// @desc    Add campaign update
// @route   POST /api/campaigns/:id/updates
// @access  Private (Campaign creator)
exports.addUpdate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  if (campaign.creator.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  const update = {
    title,
    content,
    postedBy: req.user._id,
    media: []
  };

  // Handle media uploads
  if (req.files && req.files.media) {
    const uploads = await Promise.all(
      req.files.media.map(file => uploadToCloudinary(file.path, 'campaigns/updates'))
    );
    update.media = uploads.map(u => ({
      url: u.secure_url,
      publicId: u.public_id
    }));
  }

  campaign.updates.unshift(update);
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Update added successfully',
    data: update
  });
});

// @desc    Add comment/ donation message
// @route   POST /api/campaigns/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  const campaign = await Campaign.findById(id);

  if (!campaign) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  const comment = {
    text,
    author: req.user._id,
    authorName: req.user.fullName
  };

  campaign.comments.unshift(comment);
  await campaign.save();

  res.status(201).json({
    success: true,
    message: 'Comment added',
    data: comment
  });
});

// @desc    Get campaign translation
// @route   GET /api/campaigns/:id/translation
// @access  Public
exports.getCampaignTranslation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { language } = req.query;
  const targetLanguage = language || req.language || 'en';

  const CampaignTranslation = require('../models/CampaignTranslation');

  // Try to get translation
  const translation = await CampaignTranslation.getTranslation(id, targetLanguage, 'en');

  if (!translation) {
    return res.status(404).json({
      success: false,
      message: 'Campaign not found'
    });
  }

  // Get coverage info
  const coverage = typeof translation.getTranslationCoverage === 'function' 
    ? translation.getTranslationCoverage() 
    : { percentage: 100, missingKeys: [] };

  res.status(200).json({
    success: true,
    data: {
      language: targetLanguage,
      translations: {
        title: translation.title,
        story: translation.story,
        patientName: translation.patientName,
        hospitalName: translation.hospitalName,
        diagnosis: translation.diagnosis,
        treatment: translation.treatment,
        budget: translation.budget
      },
      coverage
    }
  });
});

module.exports = exports;
