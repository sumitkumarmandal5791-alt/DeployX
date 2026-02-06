const express = require('express');
const RewardRouter = express.Router();
const {
  getAllRewards,
  getAvailableRewards,
  createReward
} = require('../controllers/rewardController');
const protect = require('../middlewares/userAuthMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Public routes
RewardRouter.get('/', getAllRewards);

// User routes (protected)
RewardRouter.get('/available', protect, getAvailableRewards); // Shows only affordable rewards


// Admin routes
RewardRouter.post('/', protect, adminOnly, createReward);

module.exports = RewardRouter;