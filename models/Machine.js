import mongoose from 'mongoose';
const { Schema } = mongoose;

const machineSchema = new Schema({
  machine_id : { type: String, required: true, unique: true },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  type: { type: String, enum: ['petit', 'grand'], required: true },
  location_type: { type: String, enum: ['institut', 'restaurant', 'centre commercial', 'espace public', 'usine'], required: true },
  status: { type: String, enum: ['actif','inactif','en_panne'], default: 'actif' },
  last_online_at: { type: Date },
  photo_url: { type: String },
  ai_accuracy: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
  //machine type
});

// Virtual pour récupérer tous les bacs de la machine
machineSchema.virtual('recyclingBins', {
  ref: 'RecyclingBin',
  localField: '_id',
  foreignField: 'machine'
});

// Virtual pour récupérer tous les produits recyclés de la machine
machineSchema.virtual('recycledProducts', {
  ref: 'RecycledProduct',
  localField: '_id',
  foreignField: 'machine'
});

// Pour que populate fonctionne avec JSON
machineSchema.set('toObject', { virtuals: true });
machineSchema.set('toJSON', { virtuals: true });

const Machine = mongoose.model('Machine', machineSchema);
export default Machine;
