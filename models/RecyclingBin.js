import mongoose from 'mongoose';
const { Schema } = mongoose;

const recyclingBinSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['PET','ALU'], required: true },
  capacity_kg: { type: Number, required: true },
  current_fill_kg: { type: Number, default: 0 },
  last_emptied_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  sensor_id: { type: String }
});

const RecyclingBin = mongoose.model('RecyclingBin', recyclingBinSchema);
export default RecyclingBin;
