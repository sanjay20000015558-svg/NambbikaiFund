import api from './api';

export const donationAPI = {
  // Create payment order
  createOrder: (data) => api.post('/donations/create-order', data),

  // Verify payment
  verifyPayment: (data) => api.post('/donations/verify', data),

  // Get my donations
  getMyDonations: (params) => api.get('/donations/my-donations', { params }),

  // Get campaign donations (owner only)
  getCampaignDonations: (campaignId, params) =>
    api.get(`/donations/campaign/${campaignId}`, { params }),

  // Get single donation
  getDonation: (id) => api.get(`/donations/${id}`),

  // Request refund
  requestRefund: (id, reason) => api.post(`/donations/${id}/refund`, { reason }),
};

export const adminDonationAPI = {
  // Get all transactions
  getTransactions: (params) => api.get('/payments/transactions', { params }),

  // Get single transaction
  getTransaction: (id) => api.get(`/payments/transactions/${id}`),

  // Process refund
  refund: (id, { amount, reason }) =>
    api.post(`/payments/transactions/${id}/refund`, { amount, reason }),
};
