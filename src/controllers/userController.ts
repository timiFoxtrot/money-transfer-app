import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import knex from "../models/knex";

export const UserController = {
  signup:
    (): RequestHandler =>
    async (req, res, next): Promise<any> => {
      const { first_name, last_name, phone_number, email, password } = req.body;

      try {
        const existingUser = await knex("users").where({ email }).first();

        if (existingUser) {
          return res.status(401).json({
            status: "error",
            message: "User with email already exist",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userId] = await knex("users").insert({
          first_name,
          last_name,
          phone_number,
          email: email.toLowerCase(),
          password: hashedPassword,
        });

        const user = await knex("users")
          .select("first_name", "last_name", "email")
          .where({ id: userId })
          .first();

        console.log({ user });

        res.status(201).json({ message: "User created successfully", user });
      } catch (error: any) {
        res
          .status(500)
          .json({ status: "error", message: "Error creating user", error });
      }
    },

  login:
    (): RequestHandler =>
    async (req, res, next): Promise<any> => {
      const { email, password } = req.body;

      try {
        const user = await knex("users").where({ email }).first();
        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res
            .status(401)
            .json({ status: "error", message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });
        res.status(200).json({ status: "success", token });
      } catch (error) {
        res
          .status(500)
          .json({ status: "error", message: "Error logging in", error });
      }
    },
};
