const express = require('express');
const router = express.Router();

const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  closeCampaign,
  addUpdate,
  addComment,
  getCampaignTranslation
} = require('../controllers/campaignController');

const {
  protect,
  optionalAuth
} = require('../middlewares/auth');

const {
  uploadCampaignFiles,
  handleMulterError
} = require('../middlewares/upload');

/* =========================
   PUBLIC ROUTES
========================= */

// Get all campaigns
router.get('/', getCampaigns);

// Get single campaign
router.get('/:id', optionalAuth, getCampaign);

// Get campaign translation
router.get('/:id/translation', optionalAuth, getCampaignTranslation);

/* =========================
    COMMENTS
========================= */

router.post(
  '/:id/comments',
  protect,
  addComment
);

/* =========================
   CAMPAIGN UPDATES
========================= */

router.post(
  '/:id/updates',
  protect,
  addUpdate
);

/* =========================
   CREATE CAMPAIGN
========================= */

router.post(
  '/',
  protect,
  (req, res, next) => {
    uploadCampaignFiles(req, res, function (err) {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  createCampaign
);

/* =========================
   UPDATE CAMPAIGN
========================= */

router.put(
  '/:id',
  protect,
  (req, res, next) => {
    uploadCampaignFiles(req, res, function (err) {
      if (err) {
        return handleMulterError(err, req, res, next);
      }
      next();
    });
  },
  updateCampaign
);

/* =========================
   DELETE CAMPAIGN
========================= */

router.delete(
  '/:id',
  protect,
  deleteCampaign
);

/* =========================
   CLOSE CAMPAIGN
========================= */

router.put(
  '/:id/close',
  protect,
  closeCampaign
);

module.exports = router;