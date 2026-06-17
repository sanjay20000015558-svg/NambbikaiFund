const express = require('express');
const router = express.Router();
const {
  createWithdrawal,
  getMyWithdrawals,
  getWithdrawal,
  cancelWithdrawal,
  verifyBankAccount
} = require('../controllers/withdrawalController');
const { protect } = require('../middlewares/auth');

// Create withdrawal request
router.post('/', protect, createWithdrawal);

// Get my withdrawals
router.get('/my-withdrawals', protect, getMyWithdrawals);

// Get single withdrawal
router.get('/:id', protect, getWithdrawal);

// Cancel withdrawal
router.put('/:id/cancel', protect, cancelWithdrawal);

// Verify bank account
router.post('/verify-bank', protect, verifyBankAccount);

module.exports = router;
