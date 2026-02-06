const mongoose = require('mongoose');

const wasteDataSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true // One entry per day
    },
    totalWeightMg: {
        type: Number,
        default: 0
    },
    totalItems: {
        type: Number,
        default: 0
    },
    categoryBreakdown: {
        type: Map,
        of: Number, // category name -> count
        default: {}
    },
    estimatedValue: {
        type: Number, // In currency
        default: 0
    },
    totalCO2SavedMg: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('WasteData', wasteDataSchema);
