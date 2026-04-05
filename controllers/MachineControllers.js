import Machine from '../models/Machine.js';
import RecycledProduct from '../models/RecycledProduct.js';

// =====================
//create machine (admin only)
// =====================
const createMachine = async (req, res) => {
  try {
    const { machine_id, name, latitude, longitude, type, location_type } = req.body;
    const machine = new Machine({
      machine_id,
      name,
      latitude,
      longitude,
      type,
      location_type
    });
    await machine.save();
    res.status(201).json(machine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// =====================
// GET ALL MACHINES
// =====================
const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find()
      .populate("recyclingBins")
      .populate("recycledProducts");
    res.json(machines);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// SEARCH MACHINES
// =====================
const searchMachines = async (req, res) => {
  try {
    const { status, type, lat, lng, radius = 0.05 } = req.query;

    // -----------------------------
    // 1) Construire les filtres simples (status + location)
    // -----------------------------
    let filters = {};


    // FILTER BY STATUS
    if (status) {
      filters.status = status;
    }

    // FILTER BY LOCATION
    if (lat && lng) {
      const minLat = parseFloat(lat) - radius;
      const maxLat = parseFloat(lat) + radius;
      const minLng = parseFloat(lng) - radius;
      const maxLng = parseFloat(lng) + radius;

      filters.latitude = { $gte: minLat, $lte: maxLat };
      filters.longitude = { $gte: minLng, $lte: maxLng };
    }

    // -----------------------------
    // 2) Requête Mongo (sans filtrer type pour l'instant)//upadtz later
    // -----------------------------
    let machines = await Machine.find(filters).populate({
      path: "recyclingBins",
      match: type ? { type: type } : {},  // FILTER BY RECYCLING TYPE
    });

    // -----------------------------
    // 3) Si un type est demandé → garder seulement les machines
    //    qui ont au moins 1 bac de ce type
    // -----------------------------
    if (type) {
      machines = machines.filter(m => m.recyclingBins.length > 0);
    }

    res.json(machines);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DASHBOARD STATS
// =====================
const getDashboardStats = async (req, res) => {
  try {
    // Total machines
    const totalMachines = await Machine.countDocuments();

    // Tous les produits recyclés
    const products = await RecycledProduct.find();

    // Total Aluminium collecté (kg)
    const totalAlu = products
      .filter(p => p.type === 'ALU')
      .reduce((sum, p) => sum + p.weight_kg, 0);

    // Total Plastique collecté (kg)
    const totalPlastique = products
      .filter(p => p.type === 'PET')
      .reduce((sum, p) => sum + p.weight_kg, 0);

    res.json({
      aluminium: { value: totalAlu,      unit: 'kg'       },
      plastique: { value: totalPlastique, unit: 'kg'      },
      machines:  { value: totalMachines, unit: 'Machines' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// DELETE MACHINE
// =====================
const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params; // This will now receive machine_id from the URL
    const deletedMachine = await Machine.findOneAndDelete({ machine_id: id });
    
    if (!deletedMachine) {
      return res.status(404).json({ message: "Machine non trouvée" });
    }
    
    res.json({ message: "Machine supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET MACHINE DETAILS
// =====================
const getMachineDetails = async (req, res) => {
  try {
    const { id } = req.params; // Expects machine_id from URL
    const machine = await Machine.findOne({ machine_id: id })
      .populate("recyclingBins")
      .populate("recycledProducts");
      
    if (!machine) {
      return res.status(404).json({ message: "Machine non trouvée" });
    }
    
    res.json(machine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default {
  getAllMachines,
  searchMachines,
  createMachine,
  getDashboardStats,
  deleteMachine,
  getMachineDetails
};
