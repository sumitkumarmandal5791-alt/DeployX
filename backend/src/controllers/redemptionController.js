const Redemption = require('../Schema/redemption');
const Reward = require('../Schema/rewardSchema');
const User = require('../Schema/userSchema');

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
// @route   POST /api/redemptions/:rewardId
// @access  Private
const redeemReward = async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.rewardId);

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
// @route   GET /api/redemptions/my-history
// @access  Private
const getMyRedemptions = async (req, res) => {
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
// @route   GET /api/redemptions/:code
// @access  Private
const getRedemptionByCode = async (req, res) => {
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

// @desc    Get all redemptions (Admin)
// @route   GET /api/redemptions
// @access  Private/Admin
const getAllRedemptions = async (req, res) => {
    try {
        const redemptions = await Redemption.find()
            .populate('user', 'name email')
            .populate('reward', 'name partnerName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: redemptions.length,
            data: redemptions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update redemption status (e.g. mark as USED)
// @route   PUT /api/redemptions/:id/status
// @access  Private/Admin
const updateRedemptionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const redemption = await Redemption.findById(req.params.id);

        if (!redemption) {
            return res.status(404).json({ success: false, message: 'Redemption not found' });
        }

        redemption.status = status;
        if (status === 'USED') {
            redemption.usedAt = Date.now();
        }

        await redemption.save();

        res.status(200).json({ success: true, data: redemption });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = {
    redeemReward,
    getMyRedemptions,
    getRedemptionByCode,
    getAllRedemptions,
    updateRedemptionStatus
};
