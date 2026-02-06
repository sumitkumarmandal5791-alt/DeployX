const Reward = require('../Schema/rewardSchema');
const User = require('../Schema/userSchema');

// @desc    Get available rewards based on user's points
// @route   GET /api/rewards/available
// @access  Private
const getAvailableRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const userPoints = user.availablePoints;

    // Get rewards user can afford
    const rewards = await Reward.find({
      isActive: true,
      pointsCost: { $lte: userPoints }, // Only affordable rewards
      minPointsRequired: { $lte: userPoints },
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ pointsCost: 1 });

    res.json({
      success: true,
      userPoints: userPoints,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all rewards (for browsing)
// @route   GET /api/rewards
// @access  Public
const getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.find({
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ pointsCost: 1 });

    res.json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





// @desc    Create reward (Admin only)
// @route   POST /api/rewards
// @access  Private/Admin
const createReward = async (req, res) => {
  try {
    const reward = await Reward.create(req.body);

    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllRewards,
  getAvailableRewards,
  createReward
};