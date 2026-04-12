import express from 'express';
const router = express.Router();

import binController from '../controllers/RecyclingBinController.js';

// Get all recycling bins
router.get('/', binController.getAllBins);

// Get bins by machine
router.get('/machine/:machineId', binController.getBinsByMachine);


// Mettre à jour le niveau d'un bac (par exemple via les capteurs de la vraie RVM)
router.put('/:id', binController.updateBin);

export default router;
