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

    const product = new RecycledProduct({ machine, type, weight_kg });
    await product.save();

    // -------------------------------------------------------------
    // Mise à jour automatique du bac (RecyclingBin) correspondant
    // -------------------------------------------------------------
    const bin = await RecyclingBin.findOne({ machine: machine, type: type });
    if (bin) {
      const oldFill = bin.current_fill_kg;
      bin.current_fill_kg += parseFloat(weight_kg);
      await bin.save();

      // Création de la notification si le bac devient plein
      if (bin.current_fill_kg >= bin.capacity_kg && oldFill < bin.capacity_kg) {
        const notification = new Notification({
          machine: machineExists._id,
          type: 'remplissage',
          message: `Le bac de ${type} de la machine "${machineExists.name}" est rempli à sa capacité maximale (${bin.capacity_kg} kg).`,
          recipient_role: 'admin',
          priority_level: 'élevé'
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

// =====================
// DELETE PRODUCT
// =====================
const deleteProduct = async (req, res) => {
  try {
    const product = await RecycledProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Produit non trouvé" });
    res.json({ message: "Produit supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  createProduct,
  getAllProducts,
  getProductsByMachine,
  getProductsByType,
  deleteProduct
};
