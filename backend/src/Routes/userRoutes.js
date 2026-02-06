const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const userAuthMiddleware = require('../middlewares/userAuthMiddleware');

// Auth Routes
userRouter.post('/register', userController.register);
userRouter.post('/login', userController.login);
userRouter.post('/logout', userController.logout);

// Protected Profile Routes
userRouter.get('/profile', userAuthMiddleware, userController.getProfile);
userRouter.put('/profile', userAuthMiddleware, userController.updateProfile);
userRouter.delete('/profile', userAuthMiddleware, userController.deleteProfile);

// Start
userRouter.get('/stats', userAuthMiddleware, userController.getUserStats);

module.exports = userRouter;
