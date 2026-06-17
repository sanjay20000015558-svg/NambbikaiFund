import api from './api';

export const adminAPI = {
  // Get dashboard stats
  getStats: (params) => api.get('/admin/stats', { params }),

  // Get alerts
  getAlerts: () => api.get('/admin/alerts'),

  // Users management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Language management
  getLanguageStats: (params) => api.get('/admin/languages/stats', { params }),
  getTranslations: (language) => api.get(`/admin/translations/${language}`),
  updateTranslation: (language, key, value) => api.post(`/admin/translations/${language}`, { key, value }),
  exportTranslations: (language) => api.get(`/admin/translations/${language}/export`),
  importTranslations: (language, { translations }) => api.post(`/admin/translations/${language}/import`, { translations })
};
