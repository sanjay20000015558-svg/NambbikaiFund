const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getPaymentMethods,
  getTransactions,
  getTransaction,
  refundPayment,
  createPaymentLink
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/auth');
const { paginationValidation, objectIdValidation } = require('../validators');
const validate = require('../validators').validate;

// Public routes
router.post('/create-order', createOrder);
router.get('/methods', getPaymentMethods);

// Protected routes
router.post('/verify', verifyPayment);
router.get('/transactions', protect, authorize('admin', 'verifier'), paginationValidation, validate, getTransactions);
router.get('/transactions/:id', protect, objectIdValidation('id'), validate, getTransaction);

// Refund (admin only)
router.post('/transactions/:id/refund', protect, authorize('admin'), objectIdValidation('id'), validate, refundPayment);

// Payment link for campaign sharing (creator only)
router.post('/create-link', protect, createPaymentLink);

module.exports = router;
