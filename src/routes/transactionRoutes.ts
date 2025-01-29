import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { TransactionController } from "../controllers/transactionController";

export const transactionRouter = Router();

transactionRouter.post(
  "/transfer",
  authenticate(),
  TransactionController.transfer()
);

transactionRouter.get(
  "/",
  authenticate(),
  TransactionController.fetchTransactions()
);
