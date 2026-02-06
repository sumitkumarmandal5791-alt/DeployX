const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },


  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin',
    required: true
  },


  wasteType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WasteType',
    required: true
  },

  //ai
  detectedItem: {
    type: String,
    required: true
  },

  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  aiExplanation: {
    type: String,
    default: 'Detected based on shape and weight analysis'
  },

  // Rewards
  pointsEarned: {
    type: Number,
    required: true
  },

  co2SavedMg: {
    type: Number,
    required: true
  },


  receiptId: {
    type: String,
    unique: true
  },


  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.pre('save', async function () {
  if (!this.receiptId) {
    this.receiptId = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);