const mongoose = require('mongoose');
const { Schema } = mongoose;

const clientSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  points: { type: Number, default: 0 },
  total_recycled_kg: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', clientSchema);
