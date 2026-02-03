const express = require('express');
const router = express.Router();
const {
  getAllRewards,
  getAvailableRewards,
  redeemReward,
  getMyRedemptions,
  getRedemptionByCode,
  createReward
} = require('../controllers/rewardController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/', getAllRewards);

// User routes (protected)
router.get('/available', protect, getAvailableRewards); // Shows only affordable rewards
router.post('/:id/redeem', protect, redeemReward);
router.get('/my-redemptions', protect, getMyRedemptions);
router.get('/redemptions/:code', protect, getRedemptionByCode);

// Admin routes
router.post('/', protect, adminOnly, createReward);

module.exports = router;