const express = require('express');
const binRouter = express.Router();
const {
  getAllBins,
  getNearbyBins,
  getBin,
  createBin,
  updateBin,
  deleteBin,
  emptyBin
} = require('../controllers/binController');
const adminMiddleware = require("../middlewares/adminMiddleware")
const userAuthMiddleware = require("../middlewares/userAuthMiddleware")
//public route
binRouter.get('/', userAuthMiddleware, getAllBins);
binRouter.get('/nearby', userAuthMiddleware, getNearbyBins);
binRouter.get('/:id', userAuthMiddleware, getBin);

//portected route
binRouter.post('/', adminMiddleware, createBin);
binRouter.put('/:id', adminMiddleware, updateBin);
binRouter.delete('/:id', adminMiddleware, deleteBin);
binRouter.post('/:id/empty', adminMiddleware, emptyBin);

module.exports = binRouter;