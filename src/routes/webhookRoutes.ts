import { Router } from "express";
import { authenticate } from "../middlewares/authenticate";
import { WebhookController } from "../controllers/webhookController";

export const webhookRouter = Router();

webhookRouter.post(
  "/",
  WebhookController.receiveFunds()
);