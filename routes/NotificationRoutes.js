import express from 'express';
const router = express.Router();

import notificationController from '../controllers/NotificationController.js';


// ADMIN

// Historique des notifications (par ville du user)
router.get(
  '/admin/:userId',
  notificationController.getNotificationsByUserCity
);

// Notifications récentes (ex: 30s)
router.get(
  '/admin/:userId/recent',
  notificationController.getRecentNotificationsByUserCity
);

// TECHNICIEN


// Historique notifications technicien
router.get(
  '/technicien/:userId',
  notificationController.getNotificationsForTechnicien
);

// Notifications récentes technicien
router.get(
  '/technicien/:userId/recent',
  notificationController.getLatestNotificationsForTechnicien
);

// VIDEUR

// Historique notifications videur
router.get(
  '/videur/:userId',
  notificationController.getNotificationsForVideur
);

// Notifications récentes videur
router.get(
  '/videur/:userId/recent',
  notificationController.getLatestNotificationsForVideur
);

export default router;
