const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Reward = require('../models/Reward');

dotenv.config();

const mockRewards = [
  {
    name: 'Starbucks ₹100 Voucher',
    description: 'Get ₹100 off on any Starbucks beverage or food item',
    type: 'VOUCHER',
    pointsCost: 50,
    minPointsRequired: 50,
    partnerName: 'Starbucks',
    partnerLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
    discountValue: '₹100 OFF',
    terms: 'Valid on orders above ₹200. Not valid with other offers.',
    category: 'FOOD',
    stock: 100
  },
  {
    name: 'DMart ₹200 Voucher',
    description: 'Shop for ₹200 less at any DMart store',
    type: 'VOUCHER',
    pointsCost: 100,
    minPointsRequired: 100,
    partnerName: 'DMart',
    partnerLogo: 'https://example.com/dmart-logo.png',
    discountValue: '₹200 OFF',
    terms: 'Valid on purchases above ₹500. Valid for 30 days.',
    category: 'SHOPPING',
    stock: 50
  },
  {
    name: 'Amazon ₹150 Voucher',
    description: 'Get ₹150 discount on Amazon shopping',
    type: 'VOUCHER',
    pointsCost: 75,
    minPointsRequired: 75,
    partnerName: 'Amazon',
    partnerLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    discountValue: '₹150 OFF',
    terms: 'Valid on orders above ₹1000. Applicable on select categories.',
    category: 'SHOPPING',
    stock: null
  },
  {
    name: 'Flipkart 20% Discount',
    description: 'Get 20% off on electronics',
    type: 'DISCOUNT',
    pointsCost: 120,
    minPointsRequired: 120,
    partnerName: 'Flipkart',
    partnerLogo: 'https://example.com/flipkart-logo.png',
    discountValue: '20% OFF',
    terms: 'Max discount ₹500. Valid on electronics only.',
    category: 'SHOPPING',
    stock: null
  },
  {
    name: 'Plant a Tree Donation',
    description: 'We plant a tree in your name',
    type: 'DONATION',
    pointsCost: 30,
    minPointsRequired: 30,
    partnerName: 'GreenEarth',
    partnerLogo: 'https://example.com/tree-logo.png',
    discountValue: '1 Tree Planted',
    terms: 'Tree will be planted within 15 days. Certificate will be emailed.',
    category: 'ECO',
    stock: null
  }
];

const seedRewards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    await Reward.deleteMany();
    await Reward.insertMany(mockRewards);

    console.log('✅ Mock rewards added!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedRewards();