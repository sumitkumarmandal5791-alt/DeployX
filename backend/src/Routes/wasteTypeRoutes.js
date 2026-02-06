const express = require('express');
const wasteRouter = express.Router();
const {
    getAllWasteTypes,
    createWasteType,
    updateWasteType,
    deleteWasteType
} = require('../controllers/wasteTypeController');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public routes
wasteRouter.get('/', getAllWasteTypes);

// Admin routes (Protected + Admin Only)
wasteRouter.post('/', adminMiddleware, createWasteType);
wasteRouter.put('/:id', adminMiddleware, updateWasteType);
wasteRouter.delete('/:id', adminMiddleware, deleteWasteType);

module.exports = wasteRouter;
