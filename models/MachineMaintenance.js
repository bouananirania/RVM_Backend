import mongoose from 'mongoose';
const { Schema } = mongoose;

const machineMaintenanceSchema = new Schema({
  machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
  performed_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  date_performed: { type: Date, default: Date.now }
});

const MachineMaintenance = mongoose.model('MachineMaintenance', machineMaintenanceSchema);
export default MachineMaintenance;
