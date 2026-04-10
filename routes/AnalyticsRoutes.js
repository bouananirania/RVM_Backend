import express from 'express';
const router = express.Router();

import analyticsController from '../controllers/AnalyticsController.js';

// GET Analytics Dashboard data
router.get('/', analyticsController.getAnalyticsDashboard);

export default router;
