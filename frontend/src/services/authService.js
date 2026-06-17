import api from './api';

export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),

  // Login user
  login: (credentials) => api.post('/auth/login', credentials),

  // Verify email
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password/${token}`, { password: newPassword, confirmPassword: newPassword }),

  // Get current user profile
  getProfile: () => api.get('/auth/me'),

  // Update profile
  updateProfile: (data) => api.put('/auth/profile', data),

  // Change password
  changePassword: (data) => api.put('/auth/change-password', data),

  // Upload profile picture
  uploadProfilePicture: (formData) => {
    return api.put('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
