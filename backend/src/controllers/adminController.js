const User = require('../Schema/userSchema');
const Bin = require('../Schema/smartBin');
const Transaction = require('../Schema/transaction');
const Alert = require('../Schema/alertSchema');
const WasteData = require('../Schema/wasteData');
const UserActivity = require('../Schema/userActivity');

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'USER' });
        const totalBins = await Bin.countDocuments();
        const totalTransactions = await Transaction.countDocuments();

        // Calculate total CO2 saved
        const transactions = await Transaction.find().select('co2SavedMg');
        const totalCO2Saved = transactions.reduce((acc, curr) => acc + (curr.co2SavedMg || 0), 0);

        // Get active alerts count
        const activeAlerts = await Alert.countDocuments({ status: 'ACTIVE' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalBins,
                totalTransactions,
                totalCO2Saved,
                activeAlerts
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'USER' }).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Bin Analytics
const getBinAnalytics = async (req, res) => {
    try {
        const bins = await Bin.find();

        const stats = {
            total: bins.length,
            active: bins.filter(b => b.status === 'ACTIVE').length,
            full: bins.filter(b => b.status === 'FULL').length,
            maintenance: bins.filter(b => b.status === 'MAINTENANCE').length,
            offline: bins.filter(b => b.status === 'OFFLINE').length
        };

        res.status(200).json({
            success: true,
            stats,
            data: bins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Recent Activity
const getRecentActivity = async (req, res) => {
    try {
        const activities = await Transaction.find()
            .populate('user', 'name email')
            .populate('bin', 'binName location')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({ success: true, count: activities.length, data: activities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Get Trend Analytics (Chart Data)
const getAnalyticsTrends = async (req, res) => {
    try {
        // Fetch last 7 days of WasteData
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const trends = await WasteData.find({ date: { $gte: sevenDaysAgo } }).sort({ date: 1 });

        // If no data, mock it for demonstration
        if (!trends || trends.length === 0) {
            const mockTrends = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                mockTrends.push({
                    date: d,
                    totalWeightMg: Math.floor(Math.random() * 5000) + 1000, // 1kg - 6kg
                    totalItems: Math.floor(Math.random() * 50) + 10,
                    estimatedValue: Math.floor(Math.random() * 100)
                });
            }
            return res.status(200).json({ success: true, data: mockTrends });
        }

        res.status(200).json({ success: true, data: trends });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Get Active Alerts
const getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find({ status: 'ACTIVE' })
            .populate('bin', 'binName location')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// [NEW] Route Optimization
// Simple logic: Returns list of FULL or >80% filled bins sorted by nearest neighbor (naive) or just location
const getOptimizedRoutes = async (req, res) => {
    try {
        // 1. Get all bins that need collection
        const targetBins = await Bin.find({
            $or: [
                { status: 'FULL' },
                { fillLevel: { $gte: 80 } }
            ]
        }).select('binName location fillLevel status');

        if (targetBins.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }

        // 2. Simple "Optimization": Sort by Fill Level DESC (prioritize fullest)
        // In a real app, we'd use TSP algorithm or OSRM with coordinates
        const sortedBins = targetBins.sort((a, b) => b.fillLevel - a.fillLevel);

        res.status(200).json({
            success: true,
            count: sortedBins.length,
            message: "Route optimized by fill level priority",
            data: sortedBins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getBinAnalytics,
    getRecentActivity,
    getAnalyticsTrends,
    getAlerts,
    getOptimizedRoutes
};
