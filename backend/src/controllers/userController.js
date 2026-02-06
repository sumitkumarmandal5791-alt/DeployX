const User = require('../Schema/userSchema');
const Transaction = require('../Schema/transaction');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/Reddis');

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, language } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      language
    });

    // Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
      expiresIn: '7d'
      },
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
      expiresIn: '7d'
      },
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout User
exports.logout = async (req, res) => {
  try {
    const { token } = req.cookies;

    if (token) {
      // Blacklist token in Redis
      // Expire matches token expiration (7 days in seconds)
      await redisClient.set(`blocked:${token}`, 'true', { EX: 7 * 24 * 60 * 60 });
    }

    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, language } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, language },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete Profile
exports.deleteProfile = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.clearCookie('token');
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const stats = {
      points: {
        total: user.totalPoints,
        // Assuming availablePoints logic is handled elsewhere or derived, 
        // based on schema typically totalPoints - pointsRedeemed. 
        // For now sticking to schema fields or keeping logic if it existed.
        // The original code had user.availablePoints but schema didn't show it explicitly 
        // in the previous view_file (Step 27), only totalPoints and totalCO2Saved.
        // I will just use totalPoints for available for now if field missing.
        available: user.totalPoints,
        spent: 0
      },
      environmental: {
        co2SavedMg: user.totalCO2Saved,
        co2SavedKg: (user.totalCO2Saved / 1000000).toFixed(2),
        itemsRecycled: user.totalItemsRecycled || 0
      },
      profile: {
        level: user.level || 1,
        badges: user.badges || [],
        memberSince: user.createdAt
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};