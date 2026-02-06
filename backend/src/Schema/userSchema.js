const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [30, "Username must be at most 30 characters"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],

  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: [0, 'Points cannot be negative']
  },
  availablePoints: {
    type: Number,
    default: 0,
    min: [0, 'Available points cannot be negative']
  },
  totalCO2Saved: {
    type: Number,
    default: 0, // in grams
  },
  totalItemsRecycled: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    badgeId: String,
    name: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate level based on total points
userSchema.methods.updateLevel = function () {
  const points = this.totalPoints;

  if (points >= 1000) this.level = 5;
  else if (points >= 500) this.level = 4;
  else if (points >= 200) this.level = 3;
  else if (points >= 50) this.level = 2;
  else this.level = 1;
};

// Award badge if not already earned
userSchema.methods.awardBadge = function (badgeId, badgeName) {
  const alreadyHas = this.badges.some(b => b.badgeId === badgeId);

  if (!alreadyHas) {
    this.badges.push({ badgeId, name: badgeName });
    return true; // New badge awarded
  }
  return false; // Already has badge
};

const User = mongoose.model('User', userSchema);
module.exports = User;
