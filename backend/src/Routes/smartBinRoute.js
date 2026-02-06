const express = require('express');
const smartBinRouter = express.Router();
const {
    createBin,
    getAllBins,
    getNearbyBins,
    getBin,
    getBinByQrCode,
    updateBin,
    deleteBin,
    emptyBin
} = require('../controllers/smartBinController');
const adminMiddleware = require('../middlewares/adminMiddleware');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Public routes
smartBinRouter.get('/', getAllBins);
smartBinRouter.get('/nearby', getNearbyBins);
smartBinRouter.get('/qr/:qrCode', getBinByQrCode);
smartBinRouter.get('/:id', getBin);

// Protected routes (Admin only)
smartBinRouter.post('/', adminMiddleware, createBin);
smartBinRouter.put('/:id', adminMiddleware, updateBin);
smartBinRouter.delete('/:id', adminMiddleware, deleteBin);
smartBinRouter.post('/:id/empty', adminMiddleware, emptyBin);

module.exports = smartBinRouter;
