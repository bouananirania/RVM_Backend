import connectDB from "./config/config.js";
import dotenv from "dotenv";
import express from "express";


dotenv.config();
connectDB();

const app = express();
app.use(express.json());


app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
