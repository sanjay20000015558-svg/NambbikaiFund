const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.cloudinary,
  params: async (req, file) => ({
    folder: 'nambikkai_fund',
    resource_type: 'auto',
    allowed_formats: [
      'jpg',
      'jpeg',
      'png',
      'gif',
      'pdf',
      'doc',
      'docx',
      'mp4',
      'mov'
    ]
  })
});

// Multer Config
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
    files: 20
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4',
      'video/quicktime'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(`Invalid file type: ${file.mimetype}`),
        false
      );
    }
  }
});

// Profile Picture
const uploadProfilePicture = upload.single('profilePicture');

// Government ID
const uploadIdProof = upload.single('governmentId');

// Campaign Files
const uploadCampaignFiles = upload.fields([
  {
    name: 'coverImage',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 10
  },
  {
    name: 'documents',
    maxCount: 10
  }
]);

// Error Handler
const handleMulterError = (err, req, res, next) => {

  console.log('========== MULTER DEBUG ==========');
  console.log('ERROR:', err);
  console.log('FIELD:', err?.field);
  console.log('CODE:', err?.code);
  console.log('==================================');

  if (err instanceof multer.MulterError) {

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected file field: ${err.field}`
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }

  next();
};

module.exports = {
  upload,
  uploadProfilePicture,
  uploadIdProof,
  uploadCampaignFiles,
  handleMulterError
};