import RecycledProduct from '../models/RecycledProduct.js';
import Machine from '../models/Machine.js';
import RecyclingBin from '../models/RecyclingBin.js';
import Notification from '../models/Notification.js';

// =====================
// CREATE RECYCLED PRODUCT
// =====================
const createProduct = async (req, res) => {
  try {
    const { machine, type, weight_kg } = req.body;

    const machineExists = await Machine.findById(machine);
    if (!machineExists) return res.status(404).json({ message: "Machine non trouvée" });

    // -------------------------------------------------------------
    // Vérification de la capacité du bac (RecyclingBin) correspondant
    // -------------------------------------------------------------
    const bin = await RecyclingBin.findOne({ machine: machine, type: type });
    if (bin) {
      if (bin.current_fill_kg + parseFloat(weight_kg) > bin.capacity_kg) {
        return res.status(400).json({ message: "Produit refusé : la capacité maximale du bac sera dépassée." });
      }
    }

    const product = new RecycledProduct({ machine, type, weight_kg });
    await product.save();

    // -------------------------------------------------------------
    // Mise à jour automatique du bac
    // -------------------------------------------------------------
    if (bin) {
      const oldFill = bin.current_fill_kg;
      bin.current_fill_kg += parseFloat(weight_kg);
      await bin.save();

      // Calcul du pourcentage de remplissage
      const percentageFill = bin.current_fill_kg / bin.capacity_kg;
      const oldPercentageFill = oldFill / bin.capacity_kg;

      // Création de la notification si le bac devient plein
      if (percentageFill >= 1 && oldPercentageFill < 1) {
        const notification = new Notification({
          machine: machineExists._id,
          type: 'remplissage',
          message: `Le bac de ${type} de la machine "${machineExists.name}" est rempli à sa capacité maximale (${bin.capacity_kg} kg).`
        });
        await notification.save();
      } else if (percentageFill >= 0.8 && oldPercentageFill < 0.8) {
        // Alerte si le bac atteint ou dépasse 80%
        const notification = new Notification({
          machine: machineExists._id,
          type: 'alerte_80',
          message: `Alerte : Le bac de ${type} de la machine "${machineExists.name}" est rempli à plus de 80%.`
        });
        await notification.save();
      }
    }

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET ALL PRODUCTS
// =====================
const getAllProducts = async (req, res) => {
  try {
    const products = await RecycledProduct.find().populate('machine', 'name machine_id city status');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET PRODUCTS BY MACHINE
// =====================
const getProductsByMachine = async (req, res) => {
  try {
    const products = await RecycledProduct.find({ machine: req.params.machineId })
      .populate('machine', 'name machine_id city status');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// GET PRODUCTS BY TYPE (PET / ALU)
// =====================
const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!['PET', 'ALU'].includes(type)) {
      return res.status(400).json({ message: "Type invalide (PET ou ALU)" });
    }
    const products = await RecycledProduct.find({ type })
      .populate('machine', 'name machine_id city status');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export default {
  createProduct,
  getAllProducts,
  getProductsByMachine,
  getProductsByType
};
