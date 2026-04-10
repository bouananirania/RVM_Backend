import express from 'express';
import workerController from '../controllers/WorkerController.js';

const router = express.Router();

router.post('/add', workerController.createWorker);
router.get('/stats/dashboard', workerController.getWorkerDashboardStats);
router.get('/all', workerController.getAllWorkers);
router.get('/role/:role', workerController.getWorkersByRole);
router.get('/status/:status', workerController.getWorkersByStatus);
router.put('/update-status/:id', workerController.updateWorkerStatus);
router.delete('/delete/:id', workerController.deleteWorker);

export default router;
