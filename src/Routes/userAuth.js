const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    select: false
  },
  phone: { 
    type: String 
  },
  role: { 
    type: String, 
    enum: ['USER', 'ADMIN'], 
    default: 'USER' 
  },
  language: { 
    type: String, 
    default: 'en' 
  },
  

  
  totalPoints: { 
    type: Number, 
    default: 0 
  },
  

  
  totalCO2Saved: { 
    type: Number, 
    default: 0 // in milligrams
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
  }],
  

  
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Calculate level based on total points
userSchema.methods.updateLevel = function() {
  const points = this.totalPoints;
  
  if (points >= 1000) this.level = 5;
  else if (points >= 500) this.level = 4;
  else if (points >= 200) this.level = 3;
  else if (points >= 50) this.level = 2;
  else this.level = 1;
};

// Award badge if not already earned
userSchema.methods.awardBadge = function(badgeId, badgeName) {
  const alreadyHas = this.badges.some(b => b.badgeId === badgeId);
  
  if (!alreadyHas) {
    this.badges.push({ badgeId, name: badgeName });
    return true; // New badge awarded
  }
  return false; // Already has badge
};

module.exports = mongoose.model('User', userSchema);