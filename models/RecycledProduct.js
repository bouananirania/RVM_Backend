const mongoose = require('mongoose');
const { Schema } = mongoose;

const recycledProductSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['PET','ALU','GLASS','HDPE','TETRA_PAK'], required: true },
  weight_kg: { type: Number, required: true },
  collected_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RecycledProduct', recycledProductSchema);
