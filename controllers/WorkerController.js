import Worker from '../models/Worker.js';
import Notification from '../models/Notification.js';
import Machine from '../models/Machine.js';

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
    const { nomcomplet, phone, city, role, email } = req.body;

    if (!['technicien', 'videur'].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }

    const worker = new Worker({
      nomcomplet,
      phone,
      city,
      role,
      email: email || null
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
// UPDATE WORKER INFO
// =====================
const updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomcomplet, phone, email, city, role, status } = req.body;

    if (role && !['technicien', 'videur'].includes(role)) {
      return res.status(400).json({ message: "Role invalide" });
    }
    if (status && !['actif', 'inactif', 'en intervention'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const updates = { updated_at: Date.now() };
    if (nomcomplet !== undefined) updates.nomcomplet = nomcomplet;
    if (phone     !== undefined) updates.phone      = phone;
    if (email     !== undefined) updates.email      = email;
    if (city      !== undefined) updates.city       = city;
    if (role      !== undefined) updates.role       = role;
    if (status    !== undefined) updates.status     = status;

    const worker = await Worker.findByIdAndUpdate(id, updates, { new: true });
    if (!worker) return res.status(404).json({ message: "Worker non trouvé" });

    res.json({ message: "Worker mis à jour", worker });
  } catch (err) {
    res.status(500).json({ error: err.message });
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


// =====================
// GET WORKER PROFILE (with calculated stats)
// =====================
const getWorkerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findById(id);
    if (!worker) return res.status(404).json({ message: "Worker non trouvé" });

    // Mapping statut interne → libellé affiché
    const statusMap = {
      'actif': 'Disponible',
      'inactif': 'Indisponible',
      'en intervention': 'En intervention'
    };

    // Tâches complétées = notifications traitées par ce worker
    const completedNotifications = await Notification.find({
      status: 'traitée',
      worker_name: worker.nomcomplet
    }).populate('machine', 'machine_id');

    const taches_completees = completedNotifications.length;

    // Machines distinctes sur lesquelles il a travaillé
    const machineIds = new Set(
      completedNotifications
        .filter(n => n.machine)
        .map(n => n.machine._id.toString())
    );
    const machines_count = machineIds.size;

    res.json({
      _id: worker._id,
      nomcomplet: worker.nomcomplet,
      phone: worker.phone,
      city: worker.city,
      role: worker.role,
      status: worker.status,
      status_label: statusMap[worker.status] || worker.status,
      machines: machines_count,
      taches_completees,
      created_at: worker.created_at
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET WORKER ACTIVITY HISTORY
// =====================
const getWorkerHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const worker = await Worker.findById(id);
    if (!worker) return res.status(404).json({ message: "Worker non trouvé" });

    const notifications = await Notification.find({
      status: 'traitée',
      worker_name: worker.nomcomplet
    })
      .populate('machine', 'machine_id name')
      .sort({ updated_at: -1 });

    const history = notifications.map(notif => ({
      date: notif.updated_at,
      machine_id: notif.machine?.machine_id || null,
      machine_name: notif.machine?.name || null,
      type_intervention: notif.type
    }));

    res.json({
      worker: {
        _id: worker._id,
        nomcomplet: worker.nomcomplet,
        role: worker.role
      },
      total_interventions: history.length,
      history
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createWorker,
  getAllWorkers,
  getWorkersByRole,
  getWorkersByStatus,
  getWorkerDashboardStats,
  updateWorkerStatus,
  updateWorker,
  deleteWorker,
  getWorkerHistory,
  getWorkerProfile
};
