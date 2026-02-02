import mongoose from 'mongoose';
const { Schema } = mongoose;

const recycledProductSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['PET','ALU'], required: true },
  weight_kg: { type: Number, required: true },
  collected_at: { type: Date, default: Date.now }
});

const RecycledProduct = mongoose.model('RecycledProduct', recycledProductSchema);
export default RecycledProduct;
