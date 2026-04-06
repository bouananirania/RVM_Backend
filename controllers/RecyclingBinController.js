import RecyclingBin from '../models/RecyclingBin.js';
import Machine from '../models/Machine.js';

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
// UPDATE BIN (IOT Sensors)
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

export default {
  getAllBins,
  getBinsByMachine,
  updateBin
};
