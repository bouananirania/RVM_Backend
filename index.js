import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/config.js";
import UserRoutes from "./routes/UserRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/User", UserRoutes);


app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
