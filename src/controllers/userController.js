const User = require('../models/User');
const Transaction = require('../models/Transaction');

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const stats = {
      points: {
        total: user.totalPoints,
        available: user.availablePoints,
        spent: user.totalPoints - user.availablePoints
      },
      environmental: {
        co2SavedMg: user.totalCO2Saved,
        co2SavedKg: (user.totalCO2Saved / 1000000).toFixed(2),
        itemsRecycled: user.totalItemsRecycled
      },
      profile: {
        level: user.level,
        badges: user.badges,
        memberSince: user.createdAt
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, language },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getUserStats,

  updateProfile
};