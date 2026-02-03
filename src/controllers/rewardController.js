const Reward = require('../models/Reward');
const Redemption = require('../models/Redemption');
const User = require('../models/User');

// @desc    Get available rewards based on user's points
// @route   GET /api/rewards/available
// @access  Private
exports.getAvailableRewards = async (req, res) => {
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
exports.getAllRewards = async (req, res) => {
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

// Helper: Generate partner-specific voucher code
function generatePartnerVoucher(partnerName, redemptionCode) {
  const partners = {
    'Starbucks': {
      prefix: 'SB',
      format: `${redemptionCode}-SB`
    },
    'DMart': {
      prefix: 'DM',
      format: `${redemptionCode}-DM`
    },
    'Amazon': {
      prefix: 'AMZ',
      format: `${redemptionCode}-AMZ`
    },
    'Flipkart': {
      prefix: 'FK',
      format: `${redemptionCode}-FK`
    }
  };

  const partner = partners[partnerName] || { format: redemptionCode };
  return partner.format;
}

// @desc    Redeem a reward
// @route   POST /api/rewards/:id/redeem
// @access  Private
exports.redeemReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    // Validate reward
    if (!reward || !reward.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found or inactive'
      });
    }

    // Check if reward is expired
    if (reward.expiryDate && reward.expiryDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This reward has expired'
      });
    }

    const user = await User.findById(req.user._id);

    // Check minimum points requirement
    if (user.availablePoints < reward.minPointsRequired) {
      return res.status(400).json({
        success: false,
        message: `You need at least ${reward.minPointsRequired} points to unlock this reward`
      });
    }

    // Check if user has enough points
    if (user.availablePoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: `Not enough points. You have ${user.availablePoints}, need ${reward.pointsCost}`
      });
    }

    // Check stock
    if (reward.stock !== null && reward.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reward out of stock'
      });
    }

    // Create redemption
    const redemption = await Redemption.create({
      user: user._id,
      reward: reward._id,
      pointsSpent: reward.pointsCost,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    // Generate partner-specific voucher code
    const partnerVoucherCode = generatePartnerVoucher(reward.partnerName, redemption.code);

    // Update redemption with voucher details
    redemption.voucherDetails = {
      partnerName: reward.partnerName,
      voucherCode: partnerVoucherCode,
      discountValue: reward.discountValue,
      terms: reward.terms
    };
    await redemption.save();

    // Deduct points from user
    user.availablePoints -= reward.pointsCost;
    await user.save();

    // Update stock
    if (reward.stock !== null) {
      reward.stock -= 1;
      await reward.save();
    }

    res.status(201).json({
      success: true,
      message: 'Reward redeemed successfully!',
      data: {
        redemption: {
          id: redemption._id,
          universalCode: redemption.code,
          status: redemption.status,
          expiresAt: redemption.expiresAt
        },
        voucher: {
          partner: reward.partnerName,
          partnerLogo: reward.partnerLogo,
          voucherCode: partnerVoucherCode,
          discountValue: reward.discountValue,
          terms: reward.terms,
          category: reward.category
        },
        user: {
          remainingPoints: user.availablePoints,
          pointsSpent: reward.pointsCost
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's redemptions (My Vouchers)
// @route   GET /api/rewards/my-redemptions
// @access  Private
exports.getMyRedemptions = async (req, res) => {
  try {
    const redemptions = await Redemption.find({ user: req.user._id })
      .populate('reward', 'name description type category partnerName partnerLogo')
      .sort({ createdAt: -1 });

    // Format response
    const formattedRedemptions = redemptions.map(r => ({
      id: r._id,
      universalCode: r.code,
      voucher: {
        partner: r.voucherDetails.partnerName,
        voucherCode: r.voucherDetails.voucherCode,
        discountValue: r.voucherDetails.discountValue,
        terms: r.voucherDetails.terms
      },
      reward: {
        name: r.reward.name,
        category: r.reward.category,
        logo: r.reward.partnerLogo
      },
      status: r.status,
      pointsSpent: r.pointsSpent,
      expiresAt: r.expiresAt,
      usedAt: r.usedAt,
      createdAt: r.createdAt
    }));

    res.json({
      success: true,
      count: formattedRedemptions.length,
      data: formattedRedemptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single redemption details
// @route   GET /api/rewards/redemptions/:code
// @access  Private
exports.getRedemptionByCode = async (req, res) => {
  try {
    const redemption = await Redemption.findOne({ code: req.params.code })
      .populate('reward', 'name description partnerName partnerLogo discountValue category')
      .populate('user', 'name email');

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption not found'
      });
    }

    // Check ownership
    if (redemption.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      data: {
        universalCode: redemption.code,
        voucher: redemption.voucherDetails,
        reward: redemption.reward,
        status: redemption.status,
        expiresAt: redemption.expiresAt,
        createdAt: redemption.createdAt
      }
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
exports.createReward = async (req, res) => {
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
  redeemReward,
  getMyRedemptions,
  getRedemptionByCode,
  createReward
};