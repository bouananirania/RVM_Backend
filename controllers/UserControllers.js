import bcrypt from 'bcrypt';
import User from '../models/User.js';

// =====================
// CREATE USER (ADMIN ONLY)
// =====================
const createUser = async (req, res) => {
  try {
    const { username, email, phone, city, password, role } = req.body;

    if (!['admin','technicien','videur'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      phone,
      city,
      role,
      password_hash: hashed
    });

    await user.save();
    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// LOGIN (ALL ROLES)
// =====================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    req.session.userId = user._id;
    req.session.role = user.role;

    res.json({ message: "Login success", role: user.role });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// LOGOUT
// =====================
const logout = async (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

// =====================
// GET ALL USERS BY ROLE
// =====================
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!['admin','technicien','videur'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const users = await User.find({ role });
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// SEARCH USERS BY ROLE WITH FILTERS
// =====================
const searchUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { username, phone, city, startDate, endDate } = req.query;

    if (!['admin','technicien','videur'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    let filters = { role };

    if (username) filters.username = { $regex: username, $options: "i" };
    if (phone) filters.phone = { $regex: phone, $options: "i" };
    if (city) filters.city = { $regex: city, $options: "i" };
    if (startDate || endDate) {
      filters.created_at = {};
      if (startDate) filters.created_at.$gte = new Date(startDate);
      if (endDate) filters.created_at.$lte = new Date(endDate);
    }

    const users = await User.find(filters);
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// EXPORT DEFAULT
// =====================
export default {
  createUser,
  login,
  logout,
  getUsersByRole,
  searchUsersByRole
};
