const User = require('../Schema/userSchema');
const Bin = require('../Schema/smartBin');

// Get Dashboard Stats (Total Users, Total Bins, etc.)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'USER' });
        const totalBins = await Bin.countDocuments();

        // Calculate total CO2 saved (aggregating from all users)
        const co2Stats = await User.aggregate([
            { $group: { _id: null, totalCO2: { $sum: "$totalCO2Saved" } } }
        ]);
        const totalCO2Saved = co2Stats.length > 0 ? co2Stats[0].totalCO2 : 0;

        const activeBins = await Bin.countDocuments({ status: 'ACTIVE' });
        const fullBins = await Bin.countDocuments({ status: 'FULL' });
        const maintenanceBins = await Bin.countDocuments({ status: 'MAINTENANCE' });

        res.status(200).json({
            stats: {
                totalUsers,
                totalBins,
                totalCO2Saved,
                binStatus: {
                    active: activeBins,
                    full: fullBins,
                    maintenance: maintenanceBins
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'USER' }).select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Bin Analytics
const getBinAnalytics = async (req, res) => {
    try {
        // Example: Distribution of fill levels
        const fillLevelStats = await Bin.aggregate([
            {
                $bucket: {
                    groupBy: "$fillLevel",
                    boundaries: [0, 25, 50, 75, 100],
                    default: "100+",
                    output: {
                        count: { $sum: 1 },
                        bins: { $push: { binName: "$binName", fillLevel: "$fillLevel" } }
                    }
                }
            }
        ]);

        res.status(200).json({ analytics: { fillLevels: fillLevelStats } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Recent Activity (Simulated using createdAt/updatedAt)
const getRecentActivity = async (req, res) => {
    try {
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt role');
        const recentBins = await Bin.find().sort({ updatedAt: -1 }).limit(5).select('binName status updatedAt fillLevel');

        res.status(200).json({
            activity: {
                recentRegistrations: recentUsers,
                recentBinUpdates: recentBins
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getBinAnalytics,
    getRecentActivity
};
