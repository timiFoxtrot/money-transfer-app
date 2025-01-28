import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import knex from "../models/knex";

export const authenticate = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid authorization header",
      });
    }

    const [, token] = authorization.split(" ");

    try {
      if (!token) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: "Authorization token not found",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      const user = await knex("users").where({ id: decoded.id }).first();

      if (!user) {
        return res
          .status(401)
          .json({ success: false, statusCode: 401, message: "Invalid user" });
      }

      delete user.password;
      res.locals.user = user;
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({
          success: false,
          statusCode: 401,
          message: error || "Invalid token",
        });
    }
  };
};
