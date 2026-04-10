import Machine from '../models/Machine.js';
import RecycledProduct from '../models/RecycledProduct.js';
import Notification from '../models/Notification.js';

const getAnalyticsDashboard = async (req, res) => {
  try {
    const now = new Date();

    // ─── Query params ────────────────────────────────────────────────────────
    // ?city=Alger   → filter everything to machines in that city
    // ?period=30D   → use 30 days instead of the default 7D
    //   Accepted values: 7D (default), 14D, 30D, 90D
    const cityFilter = req.query.city ? req.query.city.trim() : null;

    const VALID_PERIODS = { '7D': 7, '14D': 14, '30D': 30, '90D': 90 };
    const periodKey = req.query.period && VALID_PERIODS[req.query.period.toUpperCase()]
      ? req.query.period.toUpperCase()
      : '7D';
    const periodDays = VALID_PERIODS[periodKey];

    // Current period window  (e.g. last 30 days)
    const periodStart = new Date();
    periodStart.setDate(now.getDate() - periodDays);

    // Previous period window of same length (for growth comparison)
    const prevPeriodStart = new Date();
    prevPeriodStart.setDate(now.getDate() - periodDays * 2);

    // ─── Machine filter ──────────────────────────────────────────────────────
    const machineQuery = cityFilter ? { city: { $regex: new RegExp(`^${cityFilter}$`, 'i') } } : {};

    // ─── 1. Cards: total machines & à collecter ──────────────────────────────
    const totalMachines = await Machine.countDocuments(machineQuery);

    // For notification count we need machine IDs when city filter is active
    let notifQuery = { type: 'remplissage', status: 'envoyée' };
    if (cityFilter) {
      const filteredMachineIds = await Machine.find(machineQuery).distinct('_id');
      notifQuery.machine = { $in: filteredMachineIds };
    }
    const aCollecter = await Notification.countDocuments(notifQuery);

    // ─── 2. Recycled products ────────────────────────────────────────────────
    const productQuery = cityFilter
      ? { machine: { $in: await Machine.find(machineQuery).distinct('_id') } }
      : {};

    const products = await RecycledProduct.find(productQuery)
      .populate('machine', 'city name machine_id status');

    // ─── 3. Aggregation variables ────────────────────────────────────────────
    let petTotal = 0;
    let aluTotal = 0;
    let petCurrent = 0;
    let petPrev = 0;
    let aluCurrent = 0;
    let aluPrev = 0;

    // Build trend map (one entry per day across the period)
    const tendanceMap = {};
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      tendanceMap[dateStr] = 0;
    }

    const volumeParWilayaMap = {};

    products.forEach(p => {
      const pDate = p.created_at || (p._id && p._id.getTimestamp ? p._id.getTimestamp() : new Date(0));
      const weight = p.weight_kg || 0;

      // All-time totals (for distribution)
      if (p.type === 'PET') petTotal += weight;
      if (p.type === 'ALU') aluTotal += weight;

      // Current period (for growth & trend)
      if (pDate >= periodStart) {
        if (p.type === 'PET') petCurrent += weight;
        if (p.type === 'ALU') aluCurrent += weight;

        // Populate daily trend
        const dateStr = `${String(pDate.getDate()).padStart(2, '0')}/${String(pDate.getMonth() + 1).padStart(2, '0')}`;
        if (tendanceMap[dateStr] !== undefined) {
          tendanceMap[dateStr] += weight;
        }
      }
      // Previous period (for growth comparison)
      else if (pDate >= prevPeriodStart && pDate < periodStart) {
        if (p.type === 'PET') petPrev += weight;
        if (p.type === 'ALU') aluPrev += weight;
      }

      // Volume per city (only when no city filter, otherwise it would be one-entry)
      if (p.machine && p.machine.city) {
        const city = p.machine.city;
        volumeParWilayaMap[city] = (volumeParWilayaMap[city] || 0) + weight;
      }
    });

    // ─── 4. Helpers ──────────────────────────────────────────────────────────
    const calculateGrowth = (current, prev) => {
      if (prev === 0) {
        if (current === 0) return 'Stable';
        return '+100% croissance';
      }
      const growth = ((current - prev) / prev) * 100;
      if (growth > 0) return `+${Math.round(growth)}% croissance`;
      if (growth < 0) return `${Math.round(growth)}% baisse`;
      return 'Stable';
    };

    // ─── 5. Format outputs ───────────────────────────────────────────────────
    const tendance = Object.keys(tendanceMap).map(date => ({
      date,
      weight: Math.round(tendanceMap[date] * 100) / 100
    }));

    const totalWeight = petTotal + aluTotal;
    const recyc_distribution = {
      PET: totalWeight ? Math.round((petTotal / totalWeight) * 100) : 0,
      ALU: totalWeight ? Math.round((aluTotal / totalWeight) * 100) : 0
    };

    const volume_par_wilaya = Object.keys(volumeParWilayaMap)
      .map(wilaya => ({
        wilaya,
        volume: Math.round(volumeParWilayaMap[wilaya] * 100) / 100
      }))
      .sort((a, b) => b.volume - a.volume);

    // Alertes Critiques (5 dernières non traitées, filtrées par ville si besoin)
    const alertesQuery = {
      status: 'envoyée',
      type: { $in: ['panne', 'remplissage', 'alerte_80'] }
    };
    if (cityFilter) {
      alertesQuery.machine = notifQuery.machine;
    }
    const alertes_critiques = await Notification.find(alertesQuery)
      .sort({ created_at: -1 })
      .limit(5)
      .populate('machine', 'name machine_id city type');

    // Inventaire Détaillé (filtré par ville si besoin)
    const machinesWithBins = await Machine.find(machineQuery)
      .populate('recyclingBins')
      .select('-__v');

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

    // ─── 6. Response ─────────────────────────────────────────────────────────
    res.json({
      filters_applied: {
        city: cityFilter || 'all',
        period: periodKey
      },
      cards: {
        total_machines: totalMachines,
        a_collecter: aCollecter,
        plastique: {
          weight: Math.round(petTotal * 100) / 100,
          growth: calculateGrowth(petCurrent, petPrev)
        },
        aluminium: {
          weight: Math.round(aluTotal * 100) / 100,
          growth: calculateGrowth(aluCurrent, aluPrev)
        }
      },
      tendance_7_jours: tendance,   // key name kept for backward compat
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
