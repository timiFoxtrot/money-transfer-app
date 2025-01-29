import { Router } from "express";
import { AccountController } from "../controllers/accountController";
import { authenticate } from "../middlewares/authenticate";

export const accountRouter = Router();

accountRouter.post("/generate", authenticate(), AccountController.generateAccount());