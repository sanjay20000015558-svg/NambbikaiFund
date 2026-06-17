import api from './api';

export const withdrawalAPI = {
  // Create withdrawal request
  createWithdrawal: (data) => api.post('/withdrawals', data),

  // Get my withdrawals
  getMyWithdrawals: (params) => api.get('/withdrawals/my-withdrawals', { params }),

  // Get single withdrawal
  getWithdrawal: (id) => api.get(`/withdrawals/${id}`),

  // Cancel withdrawal
  cancelWithdrawal: (id, reason) =>
    api.put(`/withdrawals/${id}/cancel`, { reason }),

  // Verify bank account
  verifyBank: (data) => api.post('/withdrawals/verify-bank', data),

  // Get withdrawal stats
  getStats: () => api.get('/withdrawals/stats'),
};

export const adminWithdrawalAPI = {
  // Get all withdrawal requests
  getAll: (params) => api.get('/admin/withdrawals', { params }),

  // Process withdrawal
  process: (id, { status, notes, transactionId, utr, paymentMode }) =>
    api.put(`/admin/withdrawals/${id}/process`, {
      status,
      notes,
      transactionId,
      utr,
      paymentMode,
    }),
};
