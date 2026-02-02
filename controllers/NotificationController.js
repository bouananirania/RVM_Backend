import Machine from '../models/Machine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// =====================
// ADMIN - Historique notifications
// =====================
const getNotificationsByUserCity = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const city = user.city;

    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const notifications = await Notification.find({
      machine: { $in: machineIds }
    })
      .populate("machine", "name latitude longitude city status")
      .select("machine type message recipient_role status priority_level created_at updated_at")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getRecentNotificationsByUserCity = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const city = user.city;
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const now = new Date();
    const last30s = new Date(now.getTime() - 30 * 1000);

    const recentNotifications = await Notification.find({
      machine: { $in: machineIds },
      created_at: { $gte: last30s }
    })
      .populate("machine", "name latitude longitude city status")
      .select("machine type message recipient_role status priority_level created_at updated_at")
      .sort({ created_at: -1 });

    res.json(recentNotifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// TECHNICIEN - Historique notifications
// =====================
const getNotificationsForTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.userId;

    const user = await User.findById(technicienId);
    if (!user) return res.status(404).json({ message: "Technicien non trouvé" });
    if (user.role !== "technicien") return res.status(403).json({ message: "L'utilisateur n'est pas un technicien" });

    const city = user.city;
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const notifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "technicien"
    })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getLatestNotificationsForTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.userId;

    const user = await User.findById(technicienId);
    if (!user) return res.status(404).json({ message: "Technicien non trouvé" });
    if (user.role !== "technicien") return res.status(403).json({ message: "L'utilisateur n'est pas un technicien" });

    const city = user.city;
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const now = new Date();
    const last30s = new Date(now.getTime() - 30 * 1000);

    const recentNotifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "technicien",
      created_at: { $gte: last30s }
    })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(recentNotifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// VIDEUR - Historique notifications
// =====================
const getNotificationsForVideur = async (req, res) => {
  try {
    const videurId = req.params.userId;

    const user = await User.findById(videurId);
    if (!user) return res.status(404).json({ message: "Videur non trouvé" });
    if (user.role !== "videur") return res.status(403).json({ message: "L'utilisateur n'est pas un videur" });

    const city = user.city;
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const notifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "videur"
    })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getLatestNotificationsForVideur = async (req, res) => {
  try {
    const videurId = req.params.userId;

    const user = await User.findById(videurId);
    if (!user) return res.status(404).json({ message: "Videur non trouvé" });
    if (user.role !== "videur") return res.status(403).json({ message: "L'utilisateur n'est pas un videur" });

    const city = user.city;
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    const now = new Date();
    const last30s = new Date(now.getTime() - 30 * 1000);

    const recentNotifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "videur",
      created_at: { $gte: last30s }
    })
      .populate("machine", "name latitude longitude city status")
      .sort({ created_at: -1 });

    res.json(recentNotifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default {
  getNotificationsByUserCity,
  getRecentNotificationsByUserCity,
  getNotificationsForTechnicien,
  getLatestNotificationsForTechnicien,
  getNotificationsForVideur,
  getLatestNotificationsForVideur
};
