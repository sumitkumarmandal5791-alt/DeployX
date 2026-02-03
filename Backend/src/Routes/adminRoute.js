const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getBinAnalytics,
  getRecentActivity
} = require('../controllers/adminController');
const adminMiddleware = require("../middlewares/adminMiddleware")


router.use(adminMiddleware);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/analytics/bins', getBinAnalytics);
router.get('/activity', getRecentActivity);

module.exports = router;