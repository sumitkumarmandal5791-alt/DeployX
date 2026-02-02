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
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
    validate: {
      validator: function(v) {
      
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/.test(v);
      },
      message: props => 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
    }
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
  totalCO2Saved: {
    type: Number,
    default: 0, // in grams
   
  }
}, {
  timestamps: true
});


const User = mongoose.model('User', userSchema);
module.exports = User;
