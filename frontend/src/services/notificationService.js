import api from './api';

export const notificationAPI = {
  // Get notifications
  getNotifications: (params) => api.get('/notifications', { params }),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),

  // Get settings
  getSettings: () => api.get('/notifications/settings'),

  // Update settings
  updateSettings: (data) => api.put('/notifications/settings', data),
};
