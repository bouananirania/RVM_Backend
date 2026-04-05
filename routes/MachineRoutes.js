import express from 'express';
const router = express.Router();

import machineController from '../controllers/MachineControllers.js';

// Dashboard stats (aluminium kg, plastique DA, nb machines)
router.get('/stats', machineController.getDashboardStats);

// Get all machines
router.get('/', machineController.getAllMachines);

// Search machines (status, type, location, radius)
router.get('/search', machineController.searchMachines);
// Create machine (admin only)
router.post('/create', machineController.createMachine);

// Get machine details by machine_id
router.get('/:id', machineController.getMachineDetails);

// Delete machine
router.delete('/:id', machineController.deleteMachine);

export default router;
