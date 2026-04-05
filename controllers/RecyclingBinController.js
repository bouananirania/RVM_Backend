import RecyclingBin from '../models/RecyclingBin.js';
import Machine from '../models/Machine.js';

// =====================
// CREATE RECYCLING BIN
// =====================
const createBin = async (req, res) => {
  try {
    const { machine, type, capacity_kg, current_fill_kg } = req.body;

    const machineExists = await Machine.findById(machine);
    if (!machineExists) return res.status(404).json({ message: "Machine non trouvée" });

    const bin = new RecyclingBin({ machine, type, capacity_kg, current_fill_kg });
    await bin.save();
    res.status(201).json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ALL BINS
// =====================
const getAllBins = async (req, res) => {
  try {
    const bins = await RecyclingBin.find().populate('machine', 'name machine_id city status');
    res.json(bins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET BINS BY MACHINE
// =====================
const getBinsByMachine = async (req, res) => {
  try {
    const bins = await RecyclingBin.find({ machine: req.params.machineId })
      .populate('machine', 'name machine_id city status');
    res.json(bins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// UPDATE BIN (ex: mise à jour du remplissage)
// =====================
const updateBin = async (req, res) => {
  try {
    const bin = await RecyclingBin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!bin) return res.status(404).json({ message: "Bac non trouvé" });
    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DELETE BIN
// =====================
const deleteBin = async (req, res) => {
  try {
    const bin = await RecyclingBin.findByIdAndDelete(req.params.id);
    if (!bin) return res.status(404).json({ message: "Bac non trouvé" });
    res.json({ message: "Bac supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createBin,
  getAllBins,
  getBinsByMachine,
  updateBin,
  deleteBin
};
