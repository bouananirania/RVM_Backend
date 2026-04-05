import express from 'express';
const router = express.Router();

import notificationController from '../controllers/NotificationController.js';


// ADMIN

// Historique global des notifications (pour tous les admins)
router.get(
  '/admin',
  notificationController.getAllNotifications
);



// =====================
// GESTION DES NOTIFICATIONS
// =====================

// Mettre à jour le statut d'une notification
router.put(
  '/status/:id',
  notificationController.updateNotificationStatus
);

// Supprimer une notification
router.delete(
  '/:id',
  notificationController.deleteNotification
);

export default router;
