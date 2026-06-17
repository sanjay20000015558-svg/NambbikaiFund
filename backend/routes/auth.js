const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middlewares/auth');
const { userValidation, loginValidation, validate } = require('../validators');

// Public routes
router.post('/register', userValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', validate, forgotPassword);
router.post('/reset-password/:token', validate, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
