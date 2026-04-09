import Machine from '../models/Machine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';



// =====================
// obtenir uniquement les notifications "envoyée" 
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
// UPDATE NOTIFICATION STATUS
// =====================
const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, worker_name } = req.body;

    if (!['envoyée', 'traitée'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });

    // Vérification du nom du technicien ou videur lors de la clôture
    if (status === 'traitée' && notification.status !== 'traitée') {
      if (notification.type === 'panne' && !worker_name) {
        return res.status(400).json({ message: "Le nom du technicien est requis pour traiter une panne." });
      }
      if (notification.type === 'remplissage' && !worker_name) {
        return res.status(400).json({ message: "Le nom du videur est requis pour traiter un remplissage." });
      }

      if (worker_name) {
        // Vérifier si le travailleur existe dans la base de données
        const worker = await Worker.findOne({ nomcomplet: worker_name });
        
        if (!worker) {
          return res.status(404).json({ message: `Le travailleur '${worker_name}' n'existe pas dans la base de données.` });
        }

        if (worker.status !== 'actif') {
          return res.status(400).json({ message: `Le travailleur '${worker_name}' n'est pas actif.` });
        }

        // Vérification des rôles
        if (notification.type === 'panne' && worker.role !== 'technicien') {
          return res.status(400).json({ message: `Le travailleur '${worker_name}' n'a pas le rôle de technicien.` });
        }
        if ((notification.type === 'remplissage' || notification.type === 'alerte_80') && worker.role !== 'videur') {
          return res.status(400).json({ message: `Le travailleur '${worker_name}' n'a pas le rôle de videur.` });
        }
      }
    }

    notification.status = status;
    if (worker_name) {
      notification.worker_name = worker_name;

      // Ajouter le nom de la personne au message pour que ce soit visible dans l'historique
      if (notification.type === 'panne') {
        notification.message = `${notification.message} (Réparation effectuée par le technicien : ${worker_name})`;
      } else {
        notification.message = `${notification.message} (Bac vidé par : ${worker_name})`;
      }
    }
    notification.updated_at = Date.now();

    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};


// =====================
// Historique global des notifications 
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
// EXPORT DEFAULT
// =====================
export default {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationsByMachine,
  updateNotificationStatus
};
