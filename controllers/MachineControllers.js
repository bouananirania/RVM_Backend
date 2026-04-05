import Machine from '../models/Machine.js';
import RecycledProduct from '../models/RecycledProduct.js';
import Notification from '../models/Notification.js';

// =====================
//create machine (admin only)
// =====================
const createMachine = async (req, res) => {
  try {
    const { machine_id, name, latitude, longitude, city, address, type, location_type } = req.body;
    const machine = new Machine({
      machine_id,
      name,
      latitude,
      longitude,
      city,
      address,
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
    const machine = await Machine.findOne({ machine_id: id }).select('-_id -__v');
      
    if (!machine) {
      return res.status(404).json({ message: "Machine non trouvée" });
    }

    // Convertir en objet simple et supprimer les champs virtuels non désirés
    const machineData = machine.toObject();
    delete machineData.id;
    delete machineData.recyclingBins;
    delete machineData.recycledProducts;
    
    res.json(machineData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// UPDATE MACHINE STATUS
// =====================
const updateMachineStatus = async (req, res) => {
  try {
    const { id } = req.params; // machine_id
    const { status } = req.body;

    // Vérification du statut
    if (!['actif', 'inactif', 'en_panne'].includes(status)) {
      return res.status(400).json({ message: "Statut invalide. Valeurs autorisées: actif, inactif, en_panne." });
    }

    const oldMachine = await Machine.findOne({ machine_id: id });
    if (!oldMachine) {
      return res.status(404).json({ message: "Machine non trouvée" });
    }

    const machine = await Machine.findOneAndUpdate(
      { machine_id: id },
      { status, updated_at: Date.now() },
      { new: true } // Pour renvoyer la machine mise à jour
    ).select('-_id -__v');

    const machineData = machine.toObject();
    delete machineData.id;
    delete machineData.recyclingBins;
    delete machineData.recycledProducts;

    // Création de la notification si la machine tombe en panne
    if (status === 'en_panne' && oldMachine.status !== 'en_panne') {
      const notification = new Notification({
        machine: oldMachine._id,
        type: 'panne',
        message: `La machine "${machine.name}" (ID: ${machine.machine_id}) vient de tomber en panne.`,
        recipient_role: 'admin',
        priority_level: 'élevé'
      });
      await notification.save();
    }

    res.json({ message: "Statut mis à jour avec succès", machine: machineData });
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
  getMachineDetails,
  updateMachineStatus
};
