import Machine from '../models/Machine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// =====================
// ADMIN - Obtenir TOUTES les notifications
// =====================
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// =====================
// UPDATE NOTIFICATION STATUS
// =====================
const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['envoyée', 'lue', 'traitée'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const notification = await Notification.findByIdAndUpdate(
      id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// DELETE NOTIFICATION
// =====================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });

    res.json({ message: "Notification supprimée avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default {
  getAllNotifications,
  updateNotificationStatus,
  deleteNotification
};
