const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadToCloudinary = async (file, folder = 'nambikkai') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: `nambikkai_fund/${folder}`,
      resource_type: 'auto',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error.message);
    throw new Error('Failed to upload file');
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error.message);
    return false;
  }
};

// Configure Cloudinary for optimized delivery
cloudinary.config({
  // Default image transformations
  image: {
    transformation: {
      quality: 'auto',
      fetch_format: 'auto'
    }
  },
  // Video settings
  video: {
    codec: 'auto',
    bit_rate: 1000000
  }
});

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};
