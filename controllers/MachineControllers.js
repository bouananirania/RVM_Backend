import Machine from '../models/Machine.js';

// =====================
//create machine (admin only)
// =====================
const createMachine = async (req, res) => {
  try {
    const { machine_id, name, latitude, longitude, city, status, last_online_at, photo_url, ai_accuracy } = req.body;
    const machine = new Machine({
      machine_id,
      name,
      latitude,
      longitude,
      city,
      status,
      last_online_at,
      photo_url,
      ai_accuracy
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
    //FILTRE BY NAME
    if (req.query.name) {
      filters.name = { $regex: req.query.name, $options: "i" };
    }

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
    // 2) Requête Mongo (sans filtrer type pour l'instant)
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
// EXPORT DEFAULT
// =====================
export default {
  getAllMachines,
  searchMachines,
  createMachine
};
