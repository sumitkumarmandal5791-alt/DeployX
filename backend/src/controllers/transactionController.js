const Transaction = require('../Schema/transaction');
const User = require('../Schema/userSchema');
const Bin = require('../Schema/smartBin');
const WasteType = require('../Schema/wasteType');
const { checkBadges } = require('../Schema/badges');

// @desc    Create a new transaction (Recycle Item)
// @route   POST /api/transactions
// @access  Private (IoT or User)
// @desc    Create a new transaction (Recycle Item)
// @route   POST /api/transactions
// @access  Private (IoT or User)
const createTransaction = async (req, res) => {
    try {
        console.log("createTransaction called. Body:", req.body);
        let { binId, wasteTypeId, detectedItem, weight, count = 1 } = req.body;
        const userId = req.user._id; // From auth middleware

        // 1. Handle flexible inputs for Simulation/Demo

        // a) Handle missing WasteType ID -> Lookup by Name
        if (!wasteTypeId && detectedItem) {
            // Try specific match first
            let wt = await WasteType.findOne({
                name: { $regex: new RegExp(detectedItem, 'i') }
            });

            // If not found, try broad match (e.g. "mobile phone" matches "Phone")
            if (!wt) {
                const allTypes = await WasteType.find();
                wt = allTypes.find(t =>
                    detectedItem.toLowerCase().includes(t.name.toLowerCase()) ||
                    t.name.toLowerCase().includes(detectedItem.toLowerCase())
                );
            }

            if (wt) {
                wasteTypeId = wt._id;
                // Normalize detected item name if needed, or keep original
            }
        }

        // b) Handle missing Bin ID -> Assign nearest/default active bin
        if (!binId) {
            // Try explicit ACTIVE bin first
            let defaultBin = await Bin.findOne({ status: 'ACTIVE' });

            // Fallback: Pick ANY bin (even FULL) if simulation
            if (!defaultBin) {
                console.log("No ACTIVE bin found. Falling back to any bin.");
                defaultBin = await Bin.findOne();
            }

            if (defaultBin) {
                binId = defaultBin._id;
                console.log(`Assigned Default Bin: ${defaultBin.binName} (${defaultBin.status})`);
            } else {
                console.error("No bins found in DB at all!");
            }
        }

        // 2. Fetch related data (validate)
        if (!binId) return res.status(404).json({ success: false, message: 'Bin not found (and no default available)' });
        const bin = await Bin.findById(binId);
        if (!bin) return res.status(404).json({ success: false, message: `Bin with ID ${binId} not found` });

        if (!wasteTypeId) {
            // Fallback to "Other" if completely unknown
            const otherType = await WasteType.findOne({ name: 'Other' });
            if (otherType) wasteTypeId = otherType._id;
            else return res.status(404).json({ success: false, message: 'Waste Type not found for item: ' + detectedItem });
        }

        const wasteType = await WasteType.findById(wasteTypeId);
        if (!wasteType) return res.status(404).json({ success: false, message: `Waste Type with ID ${wasteTypeId} not found` });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: `User with ID ${userId} not found` });

        // 3. Calculate Stats
        const pointsEarned = wasteType.pointsValue * count;
        const co2Saved = wasteType.co2Saved * count;

        // 4. Create Transaction
        const transaction = await Transaction.create({
            user: userId,
            bin: binId,
            wasteType: wasteTypeId,
            detectedItem: detectedItem || wasteType.name,
            confidenceScore: req.body.confidenceScore || 95,
            pointsEarned,
            co2SavedMg: co2Saved
        });

        // 5. Update User Stats
        user.totalPoints += pointsEarned;
        user.availablePoints += pointsEarned;
        user.totalCO2Saved += co2Saved;
        user.totalItemsRecycled += count;

        // Update level
        user.updateLevel();

        // Check for new badges
        const newBadges = checkBadges(user);

        await user.save();

        // 6. Update Bin Stats
        bin.currentCount += count;
        bin.lastEmptied = Date.now(); // Optional: Update activity time
        bin.updateFillLevel();
        await bin.save();

        res.status(201).json({
            success: true,
            data: {
                transaction,
                newBadges,
                userUpdate: {
                    pointsEarned,
                    totalPoints: user.totalPoints,
                    level: user.level
                }
            }
        });

    } catch (error) {
        console.error("Transaction Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my transaction history
// @route   GET /api/transactions/my-history
// @access  Private
// @desc    Get my transaction history
// @route   GET /api/transactions/my-history
// @access  Private
const getMyTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default to 10
        const skip = (page - 1) * limit;

        const countPromise = Transaction.countDocuments({ user: req.user._id });
        const transactionsPromise = Transaction.find({ user: req.user._id })
            .populate('bin', 'binName location')
            .populate('wasteType', 'name icon')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const [total, transactions] = await Promise.all([countPromise, transactionsPromise]);

        res.status(200).json({
            success: true,
            count: transactions.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('user', 'name email')
            .populate('bin', 'binName location')
            .populate('wasteType', 'name icon');

        if (!transaction) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        // Access control: Admin or Owner
        if (transaction.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all transactions (Admin)
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('user', 'name email')
            .populate('bin', 'binName')
            .populate('wasteType', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTransaction,
    getMyTransactions,
    getTransaction,
    getAllTransactions
};
