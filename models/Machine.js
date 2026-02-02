import mongoose from 'mongoose';
const { Schema } = mongoose;

const machineSchema = new Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: { type: String, enum: ['actif','inactif','en_panne'], default: 'actif' },
  current_cash: { type: Number, default: 0 },
  total_earnings: { type: Number, default: 0 },
  last_online_at: { type: Date },
  photo_url: { type: String },
  ai_accuracy: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Virtual pour récupérer tous les bacs de la machine
machineSchema.virtual('recyclingBins', {
  ref: 'RecyclingBin',
  localField: '_id',
  foreignField: 'machine'
});

// Pour que populate fonctionne avec JSON
machineSchema.set('toObject', { virtuals: true });
machineSchema.set('toJSON', { virtuals: true });

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
