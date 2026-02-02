import express from 'express';
const router = express.Router();

import userController from '../controllers/UserControllers.js';

// AUTH

// Login
router.post('/login', userController.login);

// Logout
router.post('/logout', userController.logout);

// ADMIN – USER MANAGEMENT

// Create user (admin only – à protéger plus tard par middleware)
router.post('/', userController.createUser);

// Get all users by role
router.get('/role/:role', userController.getUsersByRole);

// Search users by role with filters
router.get('/role/:role/search', userController.searchUsersByRole);

export default router;
