import mongoose from "mongoose";

const { Schema } = mongoose;

const workerSchema = new Schema({
  nomcomplet: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  role: {
    type: String,
    enum: ["technicien", "videur"],
    required: true,
  },
  status: {
    type: String,
    enum: ["actif", "inactif", "en intervention"],
    default: "actif",
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Worker = mongoose.model("Worker", workerSchema);

export default Worker;
