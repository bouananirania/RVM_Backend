const Client = require('../models/Client');
const bcrypt = require('bcrypt');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { username, email, phone, password, confirmPassword, name, city } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const exists = await Client.findOne({ $or: [{ email }, { username }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const client = new Client({
      username,
      email,
      phone,
      name,
      city,
      password_hash: hashed
    });

    await client.save();

    res.json({ message: "Signup success" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const client = await Client.findOne({ email });
    if (!client) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, client.password_hash);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    req.session.clientId = client._id;

    res.json({ message: "Login success" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const client = await Client.findById(req.session.clientId);
    if (!client) return res.status(401).json({ message: "Not authenticated" });

    const valid = await bcrypt.compare(oldPassword, client.password_hash);
    if (!valid) return res.status(400).json({ message: "Old password incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    client.password_hash = hashed;
    await client.save();

    res.json({ message: "Password updated" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET POINTS DU CLIENT
exports.getPoints = async (req, res) => {
  try {
    const client = await Client.findById(req.session.clientId).select("points total_recycled_kg");
    res.json(client);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchClients = async (req, res) => {
  try {
    const { name, phone, city, minPoints, maxPoints, minKg, maxKg } = req.query;

    let filters = {};

    // FILTRE NOM (partiel)
    if (name) filters.name = { $regex: name, $options: "i" };

    // FILTRE PHONE (partiel)
    if (phone) filters.phone = { $regex: phone, $options: "i" };

    // FILTRE VILLE (partiel)
    if (city) filters.city = { $regex: city, $options: "i" };

    // FILTRE POINTS (intervalle)
    if (minPoints || maxPoints) {
      filters.points = {};
      if (minPoints) filters.points.$gte = Number(minPoints);
      if (maxPoints) filters.points.$lte = Number(maxPoints);
    }

    // FILTRE KG TOTAL (intervalle)
    if (minKg || maxKg) {
      filters.total_recycled_kg = {};
      if (minKg) filters.total_recycled_kg.$gte = Number(minKg);
      if (maxKg) filters.total_recycled_kg.$lte = Number(maxKg);
    }

    const clients = await Client.find(filters);

    res.json(clients);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Transaction = require("../models/Transaction");

exports.getClientHistory = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    const history = await Transaction.find({ performed_by: clientId })
      .populate("machine", "name latitude longitude") // juste ce qu’il faut
      .select("machine amount type created_at")        // juste ces colonnes
      .sort({ created_at: -1 });

    res.json(history);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
