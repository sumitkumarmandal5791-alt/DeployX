const mongoose = require('mongoose');
const wasteTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['MOBILE', 'BATTERY', 'LAPTOP', 'CHARGER', 'CABLE', 'OTHER'],
    required: true
  },
  icon: String,
  pointsValue: Number,
  co2Saved: Number,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('WasteType', wasteTypeSchema);