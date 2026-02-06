const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    bin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bin',
        required: true
    },
    type: {
        type: String,
        enum: ['CRITICAL', 'WARNING', 'INFO'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'],
        default: 'ACTIVE'
    },
    resolvedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', alertSchema);
