const express = require('express');
const RedemptionRouter = express.Router();
const {
    redeemReward,
    getMyRedemptions,
    getRedemptionByCode,
    getAllRedemptions,
    updateRedemptionStatus
} = require('../controllers/redemptionController');
const protect = require('../middlewares/userAuthMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// User Routes
RedemptionRouter.post('/:rewardId', protect, redeemReward);
RedemptionRouter.get('/my-history', protect, getMyRedemptions);
RedemptionRouter.get('/:code', protect, getRedemptionByCode);

// Admin Routes
RedemptionRouter.get('/', protect, adminOnly, getAllRedemptions);
RedemptionRouter.put('/:id/status', protect, adminOnly, updateRedemptionStatus);

module.exports = RedemptionRouter;
