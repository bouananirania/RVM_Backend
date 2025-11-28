const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['panne','remplissage','urgence'], required: true },
  message: { type: String, required: true },
  recipient_role: { type: String, enum: ['technicien','videur'], required: true },
  status: { type: String, enum: ['envoyée','lue','traitée'], default: 'envoyée' },
  priority_level: { type: String, enum: ['bas','moyen','élevé'], default: 'moyen' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
