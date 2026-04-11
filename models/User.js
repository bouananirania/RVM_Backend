import mongoose from "mongoose";

const { Schema } = mongoose;
//plus d'informations sur les utilisateurs, comme le nom complet, l'adresse, etc. 
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  nomcomplet: { type: String, required: true },
  adress: { type: String, required: true },
  password_hash: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  city: { type: String, required: true },
  resetPasswordCode: { type: String },
  resetPasswordExpires: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
