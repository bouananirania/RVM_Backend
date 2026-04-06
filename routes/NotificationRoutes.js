import express from 'express';
const router = express.Router();

import notificationController from '../controllers/NotificationController.js';


// Notifications fraîchement générées (statut "envoyée")
router.get(
  '/admin/envoyees',
  notificationController.getUnreadNotifications
);

// Mettre à jour le statut d'une notification
router.put(
  '/status/:id',
  notificationController.updateNotificationStatus
);


// Historique global des notifications 
router.get(
  '/admin',
  notificationController.getAllNotifications
);


// Historique des notifications d'une machine spécifique
router.get(
  '/machine/:machineId',
  notificationController.getNotificationsByMachine
);





export default router;
