import Machine from '../models/Machine.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Worker from '../models/Worker.js';
import { sendAssignmentEmail } from '../config/mailer.js';



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

    if (!['envoyée', 'assignée', 'traitée'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "Notification non trouvée" });

    // Validation du nom si "assignée" ou "traitée" (si ce n'est pas déjà le cas)
    if (status === 'assignée' || status === 'traitée') {
      if ((notification.type === 'panne' || notification.type === 'remplissage' || notification.type === 'alerte_80') && !worker_name && !notification.worker_name) {
         return res.status(400).json({ message: "Le nom du travailleur est requis." });
      }

      const activeWorkerName = worker_name || notification.worker_name;
      
      if (activeWorkerName) {
        const worker = await Worker.findOne({ nomcomplet: activeWorkerName });
        if (!worker) {
          return res.status(404).json({ message: `Le travailleur '${activeWorkerName}' n'existe pas.` });
        }

        // On vérifie qu'il est actif SEULEMENT quand on l'assigne pour la première fois
        if (status === 'assignée' && notification.status !== 'assignée' && worker.status !== 'actif') {
          return res.status(400).json({ message: `Le travailleur '${activeWorkerName}' n'est pas disponible (il est '${worker.status}').` });
        }

        if (notification.type === 'panne' && worker.role !== 'technicien') {
          return res.status(400).json({ message: `Le travailleur n'a pas le rôle de technicien.` });
        }
        if ((notification.type === 'remplissage' || notification.type === 'alerte_80') && worker.role !== 'videur') {
          return res.status(400).json({ message: `Le travailleur n'a pas le rôle de videur.` });
        }
      }
    }

    const isFirstTimeAssigned = status === 'assignée' && notification.status !== 'assignée';
    const isFinishedNow = status === 'traitée' && notification.status !== 'traitée';

    notification.status = status;
    if (worker_name) {
      notification.worker_name = worker_name;
    }

    // Mettre à jour le message SEULEMENT quand c'est fini ('traitée')
    if (isFinishedNow && notification.worker_name) {
      if (notification.type === 'panne') {
        notification.message = `${notification.message} (Réparation effectuée par le technicien : ${notification.worker_name})`;
      } else {
        notification.message = `${notification.message} (Bac vidé par : ${notification.worker_name})`;
      }
    }
    notification.updated_at = Date.now();

    await notification.save();

    // ── GESTION DU STATUT DU WORKER ET EMAIL EN ARRIÈRE-PLAN ──────────────────────
    res.json(notification); // Répond au client immédiatement

    if (isFirstTimeAssigned && notification.worker_name) {
      // 1. Passer le worker à "en intervention"
      Worker.findOneAndUpdate(
        { nomcomplet: notification.worker_name },
        { status: 'en intervention' },
        { new: true }
      ).then(async (assignedWorker) => {
        if (assignedWorker) console.log(`👷 Worker ${assignedWorker.nomcomplet} est maintenant en intervention.`);
        
        // 2. Envoyer l'email
        if (assignedWorker && assignedWorker.email) {
          const machine = await Machine.findById(notification.machine);
          await sendAssignmentEmail(assignedWorker.email, assignedWorker.nomcomplet, {
            notifId: notification._id.toString(),
            type: notification.type,
            message: notification.message,
            machineId: machine?.machine_id || null,
            machineName: machine?.name || null,
            machineCity: machine?.city || null,
          });
          console.log(`📧 Email envoyé à ${assignedWorker.email}`);
        }
      }).catch(err => console.error('Erreur assignation:', err.message));
    }

    if (isFinishedNow && notification.worker_name) {
      // 1. Repasser le worker à "actif" (dispo)
      Worker.findOneAndUpdate(
        { nomcomplet: notification.worker_name },
        { status: 'actif' }
      ).then(worker => {
        if (worker) console.log(`✅ Worker ${worker.nomcomplet} a fini et est de nouveau actif.`);
      }).catch(err => console.error('Erreur libération worker:', err.message));

      // 2. Repasser la machine à "actif" si c'était une panne
      if (notification.type === 'panne') {
        Machine.findByIdAndUpdate(
          notification.machine,
          { status: 'actif', updated_at: Date.now() }
        ).then(machine => {
          if (machine) console.log(`✅ Machine ${machine.name} est de nouveau active suite à réparation.`);
        }).catch(err => console.error('Erreur libération machine:', err.message));
      }
    }
    // ───────────────────────────────────────────────────────────────────────
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
// CONFIRMATION VIA EMAIL (GET)
// =====================
const completeNotificationViaEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).send('<h1>Erreur</h1><p>Notification introuvable.</p>');
    }

    if (notification.status === 'traitée') {
      return res.status(200).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
          <h1 style="color: #4CAF50;">Déjà fait !</h1>
          <p>Cette intervention a déjà été clôturée.</p>
        </div>
      `);
    }

    // On passe à traitée
    notification.status = 'traitée';
    if (notification.worker_name) {
      if (notification.type === 'panne') {
        notification.message = `${notification.message} (Réparation effectuée par le technicien : ${notification.worker_name})`;
      } else {
        notification.message = `${notification.message} (Bac vidé par : ${notification.worker_name})`;
      }
    }
    notification.updated_at = Date.now();
    await notification.save();

    // On libère le worker
    if (notification.worker_name) {
      await Worker.findOneAndUpdate(
        { nomcomplet: notification.worker_name },
        { status: 'actif' }
      );
      console.log(`✅ Worker ${notification.worker_name} a fini via email et est de nouveau actif.`);
    }

    // On libère la machine si c'était une panne
    if (notification.type === 'panne') {
      await Machine.findByIdAndUpdate(
        notification.machine,
        { status: 'actif', updated_at: Date.now() }
      );
      console.log(`✅ Machine remise en actif suite à réparation via email.`);
    }

    res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px; background-color: #f9f9f9; padding: 40px; border-radius: 10px; max-width: 500px; margin-left: auto; margin-right: auto; box-shadow: 0px 4px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #34a853; font-size: 28px;">✅ Succès !</h1>
        <p style="font-size: 16px; color: #555;">La tâche a été officiellement clôturée.</p>
        <p style="font-size: 14px; color: #888;">Vous êtes maintenant de nouveau disponible pour d'autres interventions. Vous pouvez fermer cette page.</p>
      </div>
    `);

  } catch (error) {
    console.error("Erreur complete via email:", error);
    res.status(500).send('<h1>Erreur serveur</h1>');
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default {
  getAllNotifications,
  getUnreadNotifications,
  getNotificationsByMachine,
  updateNotificationStatus,
  completeNotificationViaEmail
};
