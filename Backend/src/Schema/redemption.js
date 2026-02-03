const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  reward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward',
    required: true
  },
  
  pointsSpent: {
    type: Number,
    required: true
  },
  
  // Universal redemption code (can be used across multiple partners)
  code: {
    type: String,
    unique: true
  },
  
  // Partner-specific voucher details
  voucherDetails: {
    partnerName: String,
    voucherCode: String, // Partner's actual voucher code
    discountValue: String,
    terms: String
  },
  
  status: {
    type: String,
    enum: ['ACTIVE', 'USED', 'EXPIRED'],
    default: 'ACTIVE'
  },
  
  expiresAt: {
    type: Date,
    required: true
  },
  
  usedAt: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate redemption code
redemptionSchema.pre('save', function(next) {
  if (!this.code) {
    // Format: EWASTE-XXXXXX (6 random alphanumeric)
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.code = `EWASTE-${randomCode}`;
  }
  next();
});

module.exports = mongoose.model('Redemption', redemptionSchema);