import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { sendPasswordResetEmail } from '../config/mailer.js';

// =====================
// CREATE USER (ADMIN ONLY)
// =====================
const createUser = async (req, res) => {
  try {
    const { username, nomcomplet, adress, email, phone, city, password } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      nomcomplet,
      adress,
      email,
      phone,
      city,
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

    res.json({ message: "Login success", userId: user._id, username: user.username });

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
// CHANGE PASSWORD
// =====================
const changePassword = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body; // <-- Récupère email

    const user = await User.findOne({ email: email }); // <-- Cherche par email
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    // Vérifier l'ancien mot de passe
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Ancien mot de passe incorrect" });

    // Hasher et sauvegarder le nouveau
    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.updated_at = new Date();
    await user.save();

    res.json({ message: "Mot de passe modifié avec succès" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// FORGOT PASSWORD (Demande de réinitialisation)
// =====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable avec cette adresse e-mail." });
    }

    // Générer un code à 6 chiffres
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Date d'expiration (10 minutes)
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 10);

    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = expirationDate;
    await user.save();

    // Envoyer l'email
    await sendPasswordResetEmail(user.email, resetCode);

    res.json({ message: "Un code de réinitialisation a été envoyé à votre adresse e-mail." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// RESET PASSWORD (Vérification du code et validation du nouveau mdp)
// =====================
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findOne({ 
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: new Date() } // Vérifie que le code n'a pas expiré
    });

    if (!user) {
      return res.status(400).json({ message: "Code de réinitialisation invalide ou expiré." });
    }

    // Hasher le nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);

    // Mettre à jour l'utilisateur
    user.password_hash = hashed;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.updated_at = new Date();
    
    await user.save();

    res.json({ message: "Mot de passe réinitialisé avec succès." });

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
  changePassword,
  forgotPassword,
  resetPassword
};
