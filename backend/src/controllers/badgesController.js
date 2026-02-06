const { badges } = require('../Schema/badges');
const User = require('../Schema/userSchema');

// @desc    Get all available badges
// @route   GET /api/badges
// @access  Public
const getAllBadges = async (req, res) => {
    try {
        // Convert object to array for easier frontend consumption
        const badgeList = Object.values(badges);

        res.status(200).json({
            success: true,
            count: badgeList.length,
            data: badgeList
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my badges
// @route   GET /api/badges/my-badges
// @access  Private
const getMyBadges = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('badges');

        res.status(200).json({
            success: true,
            count: user.badges.length,
            data: user.badges
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllBadges,
    getMyBadges
};
