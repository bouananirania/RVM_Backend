import Machine from '../models/Machine.js';
import RecycledProduct from '../models/RecycledProduct.js';
import Notification from '../models/Notification.js';

const getAnalyticsDashboard = async (req, res) => {
  try {
    const now = new Date();
    
    // Dates for last 7 days and previous 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(now.getDate() - 14);

    // 1. Fetch core data
    const totalMachines = await Machine.countDocuments();
    
    // A collecter = Notifications de remplissage "envoyée"
    const aCollecter = await Notification.countDocuments({
      type: 'remplissage',
      status: 'envoyée'
    });

    // Tous les produits
    const products = await RecycledProduct.find().populate('machine', 'city name machine_id status');
    
    // Variables for aggregations
    let petTotal = 0;
    let aluTotal = 0;
    
    let petLast7 = 0;
    let petPrev7 = 0;
    
    let aluLast7 = 0;
    let aluPrev7 = 0;

    // Tendance 7 jours: initialiser un tableau des 7 derniers jours (ex: "DD/MM")
    const tendanceMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      tendanceMap[dateStr] = 0;
    }

    const volumeParWilayaMap = {};

    products.forEach(p => {
      // Pour les anciens produits sans created_at, on utilise l'ObjectId
      const pDate = p.created_at || (p._id && p._id.getTimestamp ? p._id.getTimestamp() : new Date(0));
      const weight = p.weight_kg || 0;

      // Totaux globaux
      if (p.type === 'PET') petTotal += weight;
      if (p.type === 'ALU') aluTotal += weight;

      // Croissance (7 jours vs 14 jours)
      if (pDate >= sevenDaysAgo) {
        if (p.type === 'PET') petLast7 += weight;
        if (p.type === 'ALU') aluLast7 += weight;

        // Populate Tendance for last 7 days
        const dateStr = `${String(pDate.getDate()).padStart(2, '0')}/${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        if (tendanceMap[dateStr] !== undefined) {
          tendanceMap[dateStr] += weight;
        }

      } else if (pDate >= fourteenDaysAgo && pDate < sevenDaysAgo) {
        if (p.type === 'PET') petPrev7 += weight;
        if (p.type === 'ALU') aluPrev7 += weight;
      }

      // Volume par wilaya
      if (p.machine && p.machine.city) {
        const city = p.machine.city;
        volumeParWilayaMap[city] = (volumeParWilayaMap[city] || 0) + weight;
      }
    });

    // Helper function for growth
    const calculateGrowth = (last7, prev7) => {
      if (prev7 === 0) {
        if (last7 === 0) return "Stable";
        return "+100% croissance"; // Arbitrary positive when from 0 to something
      }
      const growth = ((last7 - prev7) / prev7) * 100;
      if (growth > 0) return `+${Math.round(growth)}% croissance`;
      if (growth < 0) return `${Math.round(growth)}% baisse`;
      return "Stable";
    };

    // Format Tendance
    const tendance_7_jours = Object.keys(tendanceMap).map(date => ({
      date,
      weight: Math.round(tendanceMap[date] * 100) / 100
    }));

    // Format Distribution
    const totalWeight = petTotal + aluTotal;
    const recyc_distribution = {
      PET: totalWeight ? Math.round((petTotal / totalWeight) * 100) : 0,
      ALU: totalWeight ? Math.round((aluTotal / totalWeight) * 100) : 0
    };

    // Format Volume par Wilaya
    const volume_par_wilaya = Object.keys(volumeParWilayaMap).map(wilaya => ({
      wilaya,
      volume: Math.round(volumeParWilayaMap[wilaya] * 100) / 100
    })).sort((a, b) => b.volume - a.volume);

    // Alertes Critiques (5 dernières non traitées)
    const alertes_critiques = await Notification.find({
      status: 'envoyée',
      type: { $in: ['panne', 'remplissage', 'alerte_80'] }
    })
      .sort({ created_at: -1 })
      .limit(5)
      .populate('machine', 'name machine_id city type');

    // Inventaire Détaillé
    const machinesWithBins = await Machine.find().populate('recyclingBins').select('-__v');
    const inventaire = machinesWithBins.map(m => {
      let totalCurrentFill = 0;
      let totalCapacity = 0;
      if (m.recyclingBins && m.recyclingBins.length > 0) {
        m.recyclingBins.forEach(bin => {
          totalCurrentFill += bin.current_fill_kg || 0;
          totalCapacity += bin.capacity_kg || 0;
        });
      }
      let fill_percentage = 0;
      if (totalCapacity > 0) {
        fill_percentage = Math.round((totalCurrentFill / totalCapacity) * 100);
      }
      fill_percentage = Math.min(fill_percentage, 100);

      return {
        _id: m._id,
        machine_id: m.machine_id,
        name: m.name,
        city: m.city,
        status: m.status,
        fill_percentage
      };
    });

    res.json({
      cards: {
        total_machines: totalMachines,
        a_collecter: aCollecter,
        plastique: {
          weight: Math.round(petTotal * 100) / 100,
          growth: calculateGrowth(petLast7, petPrev7)
        },
        aluminium: {
          weight: Math.round(aluTotal * 100) / 100,
          growth: calculateGrowth(aluLast7, aluPrev7)
        }
      },
      tendance_7_jours,
      recyc_distribution,
      volume_par_wilaya,
      alertes_critiques,
      inventaire
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getAnalyticsDashboard
};
