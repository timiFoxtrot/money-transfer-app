import { Router } from "express";
import { UserController } from "../controllers/userController";

export const userRouter = Router();

userRouter.post("/signup", UserController.signup());
userRouter.post("/login", UserController.login());

