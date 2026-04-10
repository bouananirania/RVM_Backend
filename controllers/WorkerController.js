import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';

// =====================
// GET WORKER DASHBOARD STATS
// =====================
const getWorkerDashboardStats = async (req, res) => {
  try {
    // 1. Travailleurs globaux
    const totalWorkers = await Worker.countDocuments();
    const activeWorkers = await Worker.countDocuments({ status: 'actif' });

    // 2. Techniciens
    const totalTechniciens = await Worker.countDocuments({ role: 'technicien' });
    const techniciensEnIntervention = await Worker.countDocuments({ role: 'technicien', status: 'en intervention' });

    // 3. Videurs
    const totalVideurs = await Worker.countDocuments({ role: 'videur' });
    const videursDisponibles = await Worker.countDocuments({ role: 'videur', status: 'actif' });

    // 4. Tâches en attente (Notifications 'envoyée')
    // Les pannes et remplissages (100%) sont considérés comme urgents.
    const totalTasks = await Notification.countDocuments({ status: 'envoyée' });
    const urgentTasks = await Notification.countDocuments({ 
      status: 'envoyée', 
      type: { $in: ['panne', 'remplissage'] } 
    });

    res.json({
      travailleurs: {
        total: totalWorkers,
        actifs: activeWorkers
      },
      techniciens: {
        total: totalTechniciens,
        en_intervention: techniciensEnIntervention
      },
      videurs: {
        total: totalVideurs,
        disponibles: videursDisponibles
      },
      taches: {
        total: totalTasks,
        urgentes: urgentTasks
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// ADD WORKER
// =====================
const createWorker = async (req, res) => {
  try {
    const { nomcomplet, phone, city, role } = req.body;

    if (!['technicien', 'videur'].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }

    const worker = new Worker({
      nomcomplet,
      phone,
      city,
      role
    });

    await worker.save();
    res.status(201).json({ message: "Worker créé avec succès", worker });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ALL WORKERS
// =====================
const getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().sort({ created_at: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET WORKERS BY ROLE
// =====================
const getWorkersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    if (!['technicien', 'videur'].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }
    const workers = await Worker.find({ role }).sort({ created_at: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET WORKERS BY STATUS
// =====================
const getWorkersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    if (!['actif', 'inactif', 'en intervention'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }
    const workers = await Worker.find({ status }).sort({ created_at: -1 });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// UPDATE WORKER STATUS (ACTIF/INACTIF)
// =====================
const updateWorkerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['actif', 'inactif', 'en intervention'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const worker = await Worker.findByIdAndUpdate(
      id,
      { status, updated_at: Date.now() },
      { new: true }
    );

    if (!worker) return res.status(404).json({ message: "Worker non trouvé" });

    res.json(worker);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =====================
// DELETE WORKER
// =====================
const deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findByIdAndDelete(id);
    if (!worker) return res.status(404).json({ message: "Worker non trouvé" });
    res.json({ message: "Worker supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createWorker,
  getAllWorkers,
  getWorkersByRole,
  getWorkersByStatus,
  getWorkerDashboardStats,
  updateWorkerStatus,
  deleteWorker
};
