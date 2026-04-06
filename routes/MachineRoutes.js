import express from 'express';
const router = express.Router();

import machineController from '../controllers/MachineControllers.js';


// Create machine (admin only)
router.post('/create', machineController.createMachine);


// Get all machines
router.get('/', machineController.getAllMachines);


// Search machines (status, location)
router.get('/search', machineController.searchMachines);

// Dashboard stats (aluminium kg, plastique kg, nb machines)
router.get('/stats', machineController.getDashboardStats);


// Get machine details by machine_id
router.get('/:id', machineController.getMachineDetails);


// Mettre à jour le statut
router.put('/:id/status', machineController.updateMachineStatus);


// Delete machine
router.delete('/:id', machineController.deleteMachine);

export default router;
