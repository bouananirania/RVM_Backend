import express from 'express';
const router = express.Router();

import machineController from '../controllers/MachineControllers.js';

// Get all machines
router.get('/', machineController.getAllMachines);

// Search machines (status, type, location, radius)
router.get('/search', machineController.searchMachines);
// Create machine (admin only)
router.post('/create', machineController.createMachine);

export default router;
