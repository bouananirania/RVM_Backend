import express from 'express';
const router = express.Router();

import binController from '../controllers/RecyclingBinController.js';

// Create a new recycling bin
router.post('/', binController.createBin);

// Get all recycling bins
router.get('/', binController.getAllBins);

// Get bins by machine
router.get('/machine/:machineId', binController.getBinsByMachine);

// Update a bin (fill level, sensor, etc.)
router.put('/:id', binController.updateBin);

// Delete a bin
router.delete('/:id', binController.deleteBin);

export default router;
