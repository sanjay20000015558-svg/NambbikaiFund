import api from './api';

export const campaignAPI = {
  // Get all campaigns
  getCampaigns: (params) => api.get('/campaigns', { params }),

  // Get single campaign
  getCampaign: (id) => api.get(`/campaigns/${id}`),

// Create campaign
   createCampaign: (formData) => {
     return api.post('/campaigns', formData);
   },

   // Update campaign
   updateCampaign: (id, formData) => {
     return api.put(`/campaigns/${id}`, formData);
   },

  // Delete campaign
  deleteCampaign: (id) => api.delete(`/campaigns/${id}`),

  // Close campaign
  closeCampaign: (id) => api.put(`/campaigns/${id}/close`),

// Add update to campaign
   addUpdate: (id, data) => {
     return api.post(`/campaigns/${id}/updates`, data);
   },

  // Add comment
  addComment: (id, comment) => api.post(`/campaigns/${id}/comments`, { text: comment }),

  // Get campaigns by user
  getMyCampaigns: (params) => api.get('/users/my-campaigns', { params }),

  // Get campaign translation
  getCampaignTranslation: (id, language) => api.get(`/campaigns/${id}/translation`, { 
    params: { language } 
  }),
};

export const adminCampaignAPI = {
  // Get all campaigns for admin
  getAll: (params) => api.get('/admin/campaigns', { params }),

  // Approve campaign
  approve: (id, { status, notes }) =>
    api.put(`/admin/campaigns/${id}/approve`, { status, notes }),

  // Flag campaign
  flag: (id, { reason, flag }) => api.put(`/admin/campaigns/${id}/flag`, { reason, flag }),
};