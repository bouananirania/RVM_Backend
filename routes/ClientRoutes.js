import express from 'express';
const router = express.Router();

import clientController from '../controllers/ClientController.js';

// AUTH CLIENT

// Signup
router.post('/signup', clientController.signup);

// Login
router.post('/login', clientController.login);

// Logout
router.post('/logout', clientController.logout);

// CLIENT ACCOUNT

// Change password (client connecté)
router.put('/password', clientController.changePassword);

// Get client points (client connecté)
router.get('/points', clientController.getPoints);

// ADMIN / DASHBOARD

// Search clients (filters)
router.get('/search', clientController.searchClients);

// Client transaction history
router.get('/:clientId/history', clientController.getClientHistory);

export default router;
