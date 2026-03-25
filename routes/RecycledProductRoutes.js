import express from 'express';
const router = express.Router();

import productController from '../controllers/RecycledProductController.js';

// Create a new recycled product
router.post('/', productController.createProduct);

// Get all recycled products
router.get('/', productController.getAllProducts);

// Get products by machine
router.get('/machine/:machineId', productController.getProductsByMachine);

// Get products by type (PET / ALU)
router.get('/type/:type', productController.getProductsByType);

// Delete a product
router.delete('/:id', productController.deleteProduct);

export default router;
