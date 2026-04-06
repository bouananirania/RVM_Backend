import mongoose from 'mongoose';
const { Schema } = mongoose;

const notificationSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  type: { type: String, enum: ['panne','remplissage', 'alerte_80'], required: true },
  message: { type: String, required: true },
  recipient_role: { type: String, enum: ['admin'], required: true },
  status: { type: String, enum: ['envoyée','traitée'], default: 'envoyée' },
  priority_level: { type: String, enum: ['bas','moyen','élevé'], default: 'moyen' },
  worker_name: { type: String },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
