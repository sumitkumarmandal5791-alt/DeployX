const express = require('express');
const badgesRouter = express.Router();
const {
    getAllBadges,
    getMyBadges
} = require('../controllers/badgesController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Public routes (or Protected, but listing badges is usually public info)
badgesRouter.get('/', userAuthMiddleware, getAllBadges);

// Protected routes
badgesRouter.get('/my-badges', userAuthMiddleware, getMyBadges);

module.exports = badgesRouter;
