const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binName: {
    type: String,
    required: [true, 'Please add a bin name'],
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: {
      type: String,
      required: true
    }
  },
  fillLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'FULL', 'MAINTENANCE', 'OFFLINE'],
    default: 'ACTIVE'
  },
  acceptedWasteTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteType'
  }],
  capacity: {
    type: Number,
    default: 100
  },
  currentCount: {
    type: Number,
    default: 0
  },
  lastEmptied: {
    type: Date,
    default: Date.now
  },
  qrCode: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Geospatial index for $near queries
binSchema.index({ location: '2dsphere' });

binSchema.virtual('isFull').get(function () {
  return this.fillLevel >= 80 || this.currentCount >= this.capacity;
});
binSchema.methods.updateFillLevel = function () {
  this.fillLevel = Math.round((this.currentCount / this.capacity) * 100);
  if (this.fillLevel >= 80) {
    this.status = 'FULL';
  }
};

module.exports = mongoose.model('Bin', binSchema);