import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/config.js";
import clientRoutes from './routes/ClientRoutes.js';
import machineRoutes from './routes/MachineRoutes.js';
import notifRoutes from './routes/NotificationRoutes.js';
import userRoutes from './routes/UserRoutes.js';



dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/client", clientRoutes);
app.use("/user", userRoutes);
app.use("/machine", machineRoutes);
app.use("/notif", notifRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
