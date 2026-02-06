const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['VOUCHER', 'DISCOUNT', 'PRODUCT', 'DONATION'],
    required: true
  },
  
  pointsCost: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Minimum points required to see this reward
  minPointsRequired: {
    type: Number,
    default: 0
  },
  
  // Partner/Brand
  partnerName: {
    type: String,
    required: true
  },
  
  partnerLogo: {
    type: String,
    default: null
  },
  
  // Discount details
  discountValue: {
    type: String, // "₹100 OFF", "20% OFF"
    required: true
  },
  
  // Terms and conditions
  terms: {
    type: String,
    default: 'Valid for 30 days from redemption'
  },
  
  // Category for filtering
  category: {
    type: String,
    enum: ['FOOD', 'SHOPPING', 'ENTERTAINMENT', 'ECO', 'OTHER'],
    default: 'OTHER'
  },
  
  stock: {
    type: Number,
    default: null // null = unlimited
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  expiryDate: {
    type: Date,
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reward', rewardSchema);