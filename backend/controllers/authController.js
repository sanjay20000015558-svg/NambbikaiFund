const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../config/email');
const { uploadProfilePicture } = require('../middlewares/upload');

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'https://nambbikai-fund-s3ql-182qf9zur-sanjay-kumars-projects-6d1d4c33.vercel.app').split(',')[0].trim();

// Generate JWT token
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-never-use-in-production';
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { fullName, email, mobileNumber, password, confirmPassword, state, district, language } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Mobile number already registered'
      });
    }

    // Create verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      state,
      district,
      language: language || 'en',
      emailVerificationToken,
      emailVerificationExpires
    });

    // Create verification URL
    const verificationUrl = `${getFrontendUrl()}/verify-email?token=${emailVerificationToken}`;

    // Send verification email
    const emailResult = await sendEmail({
      to: email,
      ...emailTemplates.verifyEmail(verificationUrl)
    });

    // Generate token (with limited access until email verified)
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: emailResult.success
        ? 'Registration successful. Please verify your email.'
        : 'Account created. Verification email temporarily unavailable.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        language: user.language
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // Send welcome email
    await sendEmail({
      to: user.email,
      ...emailTemplates.welcome(user.fullName.split(' ')[0])
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Generic message for security
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is temporarily locked'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      }
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isVerified: user.isVerified,
        language: user.language,
        profilePicture: user.profilePicture,
        totalDonations: user.totalDonations,
        campaignsCreated: user.campaignsCreated
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      ...emailTemplates.resetPassword(resetUrl)
    });

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.loginAttempts = 0; // Reset login attempts

    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Your Password Has Been Changed',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Password Changed</title></head>
        <body style="font-family: Arial; padding: 20px;">
          <h2>Password Changed Successfully</h2>
          <p>Hello ${user.fullName.split(' ')[0]},</p>
          <p>Your password has been successfully changed. If you didn't make this change, please contact support immediately.</p>
          <p>If you need help, feel free to reach out to our support team.</p>
          <br>
          <p>Best regards,<br>Nambikkai Fund Team</p>
        </body>
        </html>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('campaigns', 'title status amountRaised targetAmount createdAt');

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = [
  uploadProfilePicture,
  async (req, res, next) => {
    try {
      const { fullName, mobileNumber, state, district, language, dateOfBirth, gender, address } = req.body;

      const updateData = {};

      if (fullName) updateData.fullName = fullName;
      if (mobileNumber) updateData.mobileNumber = mobileNumber;
      if (state) updateData.state = state;
      if (district) updateData.district = district;
      if (language) updateData.language = language;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (gender) updateData.gender = gender;
      if (address) {
        updateData.address = typeof address === 'object' ? address : JSON.parse(address);
      }

      // Handle profile picture
      if (req.file) {
        updateData.profilePicture = {
          url: req.file.secure_url,
          publicId: req.file.public_id
        };
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token (if implementing refresh tokens)
// @route   POST /api/auth/refresh-token
// @access  Private
exports.refreshToken = async (req, res, next) => {
  // Implementation for refresh token if needed
  res.status(501).json({
    success: false,
    message: 'Refresh token not implemented'
  });
};
