import Worker from '../models/Worker.js';

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
// UPDATE WORKER STATUS (ACTIF/INACTIF)
// =====================
const updateWorkerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['actif', 'inactif'].includes(status)) {
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
  updateWorkerStatus,
  deleteWorker
};
