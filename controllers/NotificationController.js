
const User = require('../models/User');
const Machine = require('../models/Machine');
const Notification = require('../models/Notification');
//****************admin************************** */
//pour historique des notif 
exports.getNotificationsByUserCity = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Récupérer le user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const city = user.city;

    // 2. Récupérer les machines qui sont dans la même ville
    const machines = await Machine.find({ city });

    const machineIds = machines.map(m => m._id);

    // 3. Renvoyer toutes les notifications complètes
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
//utiliser normalement pour les alerte immediate de notif * a verifier lors du test * 
exports.getRecentNotificationsByUserCity = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Récupérer le user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const city = user.city;

    // 2. Récupérer les machines dans la même ville
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    // 3. Notifications récentes : dernières 30 secondes
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

//********************technicien************ */
//pour historique des notif 
exports.getNotificationsForTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.userId;

    // 1. Récupérer le technicien
    const user = await User.findById(technicienId);
    if (!user) return res.status(404).json({ message: "Technicien non trouvé" });

    if (user.role !== "technicien") {
      return res.status(403).json({ message: "L'utilisateur n'est pas un technicien" });
    }

    const city = user.city;

    // 2. Récupérer toutes les machines dans sa ville
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    // 3. Récupérer toutes les notifications associées
    const notifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "technicien"
    })
      .populate("machine", "name latitude longitude city status") // infos machine
      .sort({ created_at: -1 }); // tri du plus récent au plus ancien

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
//utiliser normalement pour les alerte immediate de notif * a verifier lors du test * 
exports.getLatestNotificationsForTechnicien = async (req, res) => {
  try {
    const technicienId = req.params.userId;

    // 1. Récupérer le technicien
    const user = await User.findById(technicienId);
    if (!user) return res.status(404).json({ message: "Technicien non trouvé" });

    if (user.role !== "technicien") {
      return res.status(403).json({ message: "L'utilisateur n'est pas un technicien" });
    }

    const city = user.city;

    // 2. Récupérer toutes les machines dans sa ville
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    // 3. Notifications récentes → par exemple dernières 30 secondes
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


//********************************VIDEUR ************ */
exports.getNotificationsForVideur = async (req, res) => {
  try {
    const videurId = req.params.userId;

    // 1. Récupérer le videur
    const user = await User.findById(videurId);
    if (!user) return res.status(404).json({ message: "Videur non trouvé" });

    if (user.role !== "videur") {
      return res.status(403).json({ message: "L'utilisateur n'est pas un videur" });
    }

    const city = user.city;

    // 2. Récupérer toutes les machines dans sa ville
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    // 3. Récupérer toutes les notifications associées
    const notifications = await Notification.find({
      machine: { $in: machineIds },
      recipient_role: "videur"
    })
      .populate("machine", "name latitude longitude city status") // infos machine
      .sort({ created_at: -1 }); // tri du plus récent au plus ancien

    res.json(notifications);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.getLatestNotificationsForVideur = async (req, res) => {
  try {
    const videurId = req.params.userId;

    // 1. Récupérer le videur
    const user = await User.findById(videurId);
    if (!user) return res.status(404).json({ message: "Videur non trouvé" });

    if (user.role !== "videur") {
      return res.status(403).json({ message: "L'utilisateur n'est pas un videur" });
    }

    const city = user.city;

    // 2. Récupérer toutes les machines dans sa ville
    const machines = await Machine.find({ city });
    const machineIds = machines.map(m => m._id);

    // 3. Notifications récentes → par exemple dernières 30 secondes
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
