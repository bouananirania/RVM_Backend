import mongoose from 'mongoose';

const { Schema } = mongoose;

const workerActivitySchema = new Schema({
  worker: {
    type: Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum: ['maintenance', 'vidage', 'reparation', 'inspection', 'autre'],
    default: 'autre'
  },
  machines: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Machine'
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

const WorkerActivity = mongoose.model('WorkerActivity', workerActivitySchema);

export default WorkerActivity;
