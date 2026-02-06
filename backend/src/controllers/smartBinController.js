const Bin = require('../Schema/smartBin');

// @desc    Create a new smart bin
// @route   POST /api/smartbin
// @access  Private/Admin
const createBin = async (req, res) => {
    try {
        const bin = await Bin.create(req.body);
        res.status(201).json({
            success: true,
            data: bin
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bins
// @route   GET /api/smartbin
// @access  Public
const getAllBins = async (req, res) => {
    try {
        const bins = await Bin.find();
        res.status(200).json({
            success: true,
            count: bins.length,
            data: bins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby bins
// @route   GET /api/smartbin/nearby?lat=x&lng=y
// @access  Public
const getNearbyBins = async (req, res) => {
    try {
        const { lat, lng, distance = 5000, wasteType } = req.query; // distance in meters, default 5km

        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: 'Please provide lat and lng' });
        }

        let query = {
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(distance)
                }
            }
        };

        // If wasteType name is provided, find its ID and filter
        if (wasteType) {
            console.log('🔍 Looking for waste type:', wasteType);
            const WasteType = require('../Schema/wasteType');
            const wasteTypeDoc = await WasteType.findOne({ name: wasteType });
            console.log('📦 Found waste type doc:', wasteTypeDoc);

            if (wasteTypeDoc) {
                query.acceptedWasteTypes = wasteTypeDoc._id;
                console.log('✅ Added to query:', query.acceptedWasteTypes);
                const data = await Bin.find(query).populate('acceptedWasteTypes');
                return res.status(200).json({
                    success: true,
                    count: data.length,
                    data: data
                });
            } else {
                // Let's see what waste types actually exist
                const allWasteTypes = await WasteType.find({});
                console.log('❌ Waste type not found. Available types:', allWasteTypes.map(t => t.name));

                // specific waste type not found, return empty or ignore? 
                // Let's return empty to be safe as no bin can match a non-existent type
                return res.status(200).json({
                    success: true,
                    count: 0,
                    data: []
                });
            }
        }

        const bins = await Bin.find(query).populate('acceptedWasteTypes');

        res.status(200).json({
            success: true,
            count: bins.length,
            data: bins
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single bin
// @route   GET /api/smartbin/:id
// @access  Public
const getBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) {
            return res.status(404).json({ success: false, message: 'Bin not found' });
        }
        res.status(200).json({ success: true, data: bin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get bin by QR Code
// @route   GET /api/smartbin/qr/:qrCode
// @access  Public
const getBinByQrCode = async (req, res) => {
    try {
        const { qrCode } = req.params;
        const bin = await Bin.findOne({ qrCode }).populate('acceptedWasteTypes');

        if (!bin) {
            return res.status(404).json({ success: false, message: 'Bin not found' });
        }

        res.status(200).json({ success: true, data: bin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


const updateBin = async (req, res) => {
    try {
        const bin = await Bin.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!bin) {
            return res.status(404).json({ success: false, message: 'Bin not found' });
        }
        res.status(200).json({ success: true, data: bin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete bin
// @route   DELETE /api/smartbin/:id
// @access  Private/Admin
const deleteBin = async (req, res) => {
    try {
        const bin = await Bin.findByIdAndDelete(req.params.id);
        if (!bin) {
            return res.status(404).json({ success: false, message: 'Bin not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Empty bin (reset fill level)
// @route   POST /api/smartbin/:id/empty
// @access  Private/Admin
const emptyBin = async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) {
            return res.status(404).json({ success: false, message: 'Bin not found' });
        }

        bin.fillLevel = 0;
        bin.status = 'ACTIVE';
        bin.currentCount = 0;
        bin.lastEmptied = Date.now();
        await bin.save();

        res.status(200).json({ success: true, data: bin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBin,
    getAllBins,
    getNearbyBins,
    getBin,
    getBinByQrCode,
    updateBin,
    deleteBin,
    emptyBin
};
