import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./routes/userRoutes";
import knex from "./models/knex";
import { accountRouter } from "./routes/accountRoutes";
import { transactionRouter } from "./routes/transactionRoutes";
import { webhookRouter } from "./routes/webhookRoutes";
import { handleErrors } from "./middlewares/error";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://webhook.site", // Replace with your specific origin
    methods: ["POST", "GET"], // Allow only necessary methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow necessary headers
  })
);

// Sample database connection check
knex
  .raw("SELECT 1")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit if the database is not connected
  });

app.get("/api/health", (req: Request, res: Response): any => {
  return res.status(200).json({
    status: "status",
    message: "server is up and running",
    data: null,
  });
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/webhook", webhookRouter);

app.use(handleErrors);

app.use((req, res, _next) => {
  res.status(404).json({
    status: "error",
    message: "resource not found",
    path: req.url,
  });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
