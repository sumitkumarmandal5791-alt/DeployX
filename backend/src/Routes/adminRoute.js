
const adminMiddleware = require("../middlewares/adminMiddleware")
const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getBinAnalytics,
  getRecentActivity,
  getAnalyticsTrends,
  getAlerts,
  getOptimizedRoutes
} = require('../controllers/adminController');


router.use(adminMiddleware);

router.get('/dashboard', adminMiddleware, getDashboardStats);
router.get('/users', adminMiddleware, getAllUsers);
router.get('/analytics/bins', adminMiddleware, getBinAnalytics);
router.get('/analytics/trends', adminMiddleware, getAnalyticsTrends); // New
router.get('/activity', adminMiddleware, getRecentActivity);
router.get('/alerts', adminMiddleware, getAlerts); // New
router.get('/routes/optimize', adminMiddleware, getOptimizedRoutes); // New

module.exports = router;