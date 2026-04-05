import Machine from '../models/Machine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// =====================
// ADMIN - Obtenir TOUTES les notifications
// =====================
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ status: 'traitée' })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// =====================
// ADMIN - Obtenir uniquement les notifications "envoyée" (non lues)
// =====================
const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ status: 'envoyée' })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// Obtenir l'historique des notifications pour une machine spécifique
// =====================
const getNotificationsByMachine = async (req, res) => {
  try {
    const { machineId } = req.params;

    // Si on nous donne l'ID public personnalisé (ex: "M001") au lieu du _id MongoDB,
    // on va d'abord chercher le _id interne de la machine.
    let machineObjectId = machineId;
    if (machineId.length !== 24) {
      const machineInfo = await Machine.findOne({ machine_id: machineId });
      if (!machineInfo) {
        return res.status(404).json({ message: "Machine non trouvée" });
      }
      machineObjectId = machineInfo._id;
    }

    const notifications = await Notification.find({ machine: machineObjectId, status: 'traitée' })
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

    if (!['envoyée', 'traitée'].includes(status)) {
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
// EXPORT DEFAULT
// =====================
export default {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationsByMachine,
  updateNotificationStatus
};
