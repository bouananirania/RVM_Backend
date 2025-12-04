const mongoose = require('mongoose');
const { Schema } = mongoose;

const transactionSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['retrait','points'], required: true },
  performed_by: { type: Schema.Types.ObjectId, ref: 'Client' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
