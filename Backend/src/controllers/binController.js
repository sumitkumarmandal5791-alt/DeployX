const Bin = require('../Schema/smartBin');
const { validate } = require('../utils/validator');

// Get all bins (with optional filtering)
const getAllBins = async (req, res) => {
    try {
        const bins = await Bin.find();
        res.status(200).json({ bins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get nearby bins
const getNearbyBins = async (req, res) => {
    const { latitude, longitude, radius = 5000 } = req.query; // radius in meters

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    try {
        const bins = await Bin.find({
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: parseInt(radius)
                }
            }
        });
        res.status(200).json({ bins });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single bin by ID
const getBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }
        res.status(200).json({ bin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new bin
const createBin = async (req, res) => {
    try {
        // Basic validation could go here if not handled by schema/middleware
        const bin = new Bin(req.body);
        await bin.save();
        res.status(201).json({ bin, message: 'Bin created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a bin
const updateBin = async (req, res) => {
    try {
        const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }
        res.status(200).json({ bin, message: 'Bin updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a bin
const deleteBin = async (req, res) => {
    try {
        const bin = await Bin.findByIdAndDelete(req.params.id);
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }
        res.status(200).json({ message: 'Bin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Empty a bin (reset fill level)
const emptyBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) {
            return res.status(404).json({ message: 'Bin not found' });
        }

        bin.fillLevel = 0;
        bin.currentCount = 0;
        bin.status = 'ACTIVE';
        bin.lastEmptied = Date.now();

        await bin.save();

        res.status(200).json({ bin, message: 'Bin emptied successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllBins,
    getNearbyBins,
    getBin,
    createBin,
    updateBin,
    deleteBin,
    emptyBin
};
