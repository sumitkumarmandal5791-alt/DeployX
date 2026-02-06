const express = require('express');
const TransactionRouter = express.Router();
const {
    createTransaction,
    getMyTransactions,
    getTransaction,
    getAllTransactions
} = require('../controllers/transactionController');

const protect = require('../middlewares/userAuthMiddleware');
const adminOnly = require('../middlewares/adminMiddleware');

// Public/IoT Route (Ideally should have separate IoT middleware, using protect for now)
TransactionRouter.post('/', protect, createTransaction);

// User Routes
TransactionRouter.get('/my-history', protect, getMyTransactions);
TransactionRouter.get('/:id', protect, getTransaction);

// Admin Routes
TransactionRouter.get('/', protect, adminOnly, getAllTransactions);

module.exports = TransactionRouter;
