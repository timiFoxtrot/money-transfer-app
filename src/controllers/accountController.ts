import { RequestHandler } from "express";
import knex from "../models/knex";
import { generateAccount } from "../services/raven";
import { IUser } from "../interfaces";

export const AccountController = {
  generateAccount:
    (): RequestHandler =>
    async (req, res, next): Promise<any> => {
      try {
        const userId = res.locals.user.id;
        const amount = req.body.amount;
        const user: IUser = await knex("users").where({ id: userId }).first();
        const { first_name, last_name, phone_number, email } = user;
        const generatedAccountResponse = await generateAccount({
          first_name,
          last_name,
          phone: phone_number,
          amount,
          email,
        });

        if (generatedAccountResponse.status === "success") {
          const { account_number, amount } = generatedAccountResponse.data;
          // save in account table
          const [accountId] = await knex("accounts").insert({
            user_id: userId,
            account_number,
            balance: amount,
          });

          const account = await knex("accounts")
            .select("account_number", "balance")
            .where({ id: accountId })
            // .orderBy("created_at", "desc")
            .first();

          return res
            .status(201)
            .json({ message: "Account generated successfully", data: account });
        }
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Error generating account",
          error,
        });
      }
    },
};
