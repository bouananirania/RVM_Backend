const mongoose = require('mongoose');
const { Schema } = mongoose;

const recyclingBinSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['plastique','papier','metal','verre'], required: true },
  capacity_kg: { type: Number, required: true },
  current_fill_kg: { type: Number, default: 0 },
  last_emptied_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  sensor_id: { type: String }
});

module.exports = mongoose.model('RecyclingBin', recyclingBinSchema);
