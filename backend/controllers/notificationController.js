const asyncHandler = require('../middlewares/asyncHandler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// @desc    Get all notifications for user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const query = { recipient: req.user._id };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(query)
  ]);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read'
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Notification.findOneAndDelete({
    _id: id,
    recipient: req.user._id
  });

  res.status(200).json({
    success: true,
    message: 'Notification deleted'
  });
});

// @desc    Get notification settings
// @route   GET /api/notifications/settings
// @access  Private
exports.getSettings = asyncHandler(async (req, res) => {
  // Return current user's notification preferences
  // In a real app, you'd have a NotificationSettings collection
  const user = await User.findById(req.user._id).select('emailNotifications');

  res.status(200).json({
    success: true,
    data: {
      emailNotifications: user.emailNotifications
    }
  });
});

// @desc    Update notification settings
// @route   PUT /api/notifications/settings
// @access  Private
exports.updateSettings = asyncHandler(async (req, res) => {
  const { emailNotifications } = req.body;

  await User.findByIdAndUpdate(req.user._id, {
    emailNotifications: emailNotifications !== undefined ? emailNotifications : true
  });

  res.status(200).json({
    success: true,
    message: 'Notification settings updated'
  });
});
