import { Router } from "express";
import { UserController } from "../controllers/userController";
import { createUserSchema } from "../validations/users";

export const userRouter = Router();

userRouter.post("/signup", createUserSchema, UserController.signup());
userRouter.post("/login", UserController.login());
