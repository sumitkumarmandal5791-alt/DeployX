const WasteType = require('../Schema/wasteType');

// @desc    Get all waste types
// @route   GET /api/wastetypes
// @access  Public
const getAllWasteTypes = async (req, res) => {
    try {
        const wasteTypes = await WasteType.find({ isActive: true });
        res.status(200).json({
            success: true,
            count: wasteTypes.length,
            data: wasteTypes
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a waste type
// @route   POST /api/wastetypes
// @access  Private/Admin
const createWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.create(req.body);
        res.status(201).json({
            success: true,
            data: wasteType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a waste type
// @route   PUT /api/wastetypes/:id
// @access  Private/Admin
const updateWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!wasteType) {
            return res.status(404).json({ success: false, message: 'Waste Type not found' });
        }

        res.status(200).json({
            success: true,
            data: wasteType
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a waste type (Soft delete)
// @route   DELETE /api/wastetypes/:id
// @access  Private/Admin
const deleteWasteType = async (req, res) => {
    try {
        const wasteType = await WasteType.findById(req.params.id);

        if (!wasteType) {
            return res.status(404).json({ success: false, message: 'Waste Type not found' });
        }

        // Soft delete by setting isActive to false
        wasteType.isActive = false;
        await wasteType.save();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllWasteTypes,
    createWasteType,
    updateWasteType,
    deleteWasteType
};
