const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getMyCampaigns,
  getMyDonations,
  deleteAccount,
  updateNotificationPreferences
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { upload, handleMulterError } = require('../middlewares/upload');

// Protected routes - require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile-picture', upload.single('profilePicture'), handleMulterError, uploadProfilePicture);
router.get('/my-campaigns', getMyCampaigns);
router.get('/my-donations', getMyDonations);
router.put('/notification-preferences', updateNotificationPreferences);
router.delete('/account', deleteAccount);

module.exports = router;
