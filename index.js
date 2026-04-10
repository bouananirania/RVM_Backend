import dotenv from "dotenv";
import express from "express";
import session from "express-session";   // 👈 AJOUTE ÇA
import connectDB from "./config/config.js";


import machineRoutes from './routes/MachineRoutes.js';
import notifRoutes from './routes/NotificationRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import binRoutes from './routes/RecyclingBinRoutes.js';
import productRoutes from './routes/RecycledProductRoutes.js';

import workerRoutes from './routes/WorkerRoutes.js';
import analyticsRoutes from './routes/AnalyticsRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// 🔥 SESSION MIDDLEWARE (TRÈS IMPORTANT)
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false   // true seulement en https
  }
}));

// ROUTES

app.use("/user", userRoutes);
app.use("/machine", machineRoutes);
app.use("/notif", notifRoutes);
app.use("/bin", binRoutes);
app.use("/product", productRoutes);
app.use("/worker", workerRoutes);
app.use("/analytics", analyticsRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
