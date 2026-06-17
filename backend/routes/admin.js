const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getStats,
  getAllCampaigns,
  approveCampaign,
  verifyCampaign,
  flagCampaign,
  getAllWithdrawals,
  processWithdrawal,
  getAlerts,
  getLanguageStats,
  updateTranslation,
  getTranslations,
  exportTranslations,
  importTranslations
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const { paginationValidation, objectIdValidation } = require('../validators');
const validate = require('../validators').validate;

// All admin routes require admin or verifier role
router.use(protect);
router.use(authorize('admin', 'verifier'));

// Dashboard stats
router.get('/stats', getStats);

// Users management
router.get('/users', paginationValidation, validate, getUsers);
router.get('/users/:id', objectIdValidation('id'), validate, getUser);
router.put('/users/:id', objectIdValidation('id'), validate, updateUser);
router.delete('/users/:id', deleteUser);

// Campaigns management
router.get('/campaigns', paginationValidation, validate, getAllCampaigns);
router.put('/campaigns/:id/approve', objectIdValidation('id'), validate, approveCampaign);
router.put('/campaigns/:id/verify', objectIdValidation('id'), validate, verifyCampaign);
router.put('/campaigns/:id/flag', objectIdValidation('id'), validate, flagCampaign);

// Withdrawals management
router.get('/withdrawals', getAllWithdrawals);
router.put('/withdrawals/:id/process', objectIdValidation('id'), validate, processWithdrawal);

// Alerts and monitoring
router.get('/alerts', getAlerts);

// Language management
router.get('/languages/stats', getLanguageStats);
router.get('/translations/:language', getTranslations);
router.post('/translations/:language', updateTranslation);
router.get('/translations/:language/export', exportTranslations);
router.post('/translations/:language/import', importTranslations);

module.exports = router;