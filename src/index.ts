import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/userRoutes";
import knex from "./models/knex";

dotenv.config();
const app = express();
app.use(express.json());

// Sample database connection check
knex.raw("SELECT 1")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit if the database is not connected
  });

// Routes
app.use("/api/users", userRouter);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
