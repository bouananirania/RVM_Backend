import express from 'express';
const router = express.Router();

import notificationController from '../controllers/NotificationController.js';


// ADMIN

// Historique global des notifications (pour tous les admins)
router.get(
  '/admin',
  notificationController.getAllNotifications
);

// Notifications fraîchement générées (statut "envoyée")
router.get(
  '/admin/envoyees',
  notificationController.getUnreadNotifications
);

// Historique des notifications d'une machine spécifique
router.get(
  '/machine/:machineId',
  notificationController.getNotificationsByMachine
);



// =====================
// GESTION DES NOTIFICATIONS
// =====================

// Mettre à jour le statut d'une notification
router.put(
  '/status/:id',
  notificationController.updateNotificationStatus
);



export default router;
