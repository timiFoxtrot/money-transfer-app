import { RequestHandler } from "express";
import knex from "../models/knex";
import { transferFunds } from "../services/raven";
import { TransactionStatus, TransactionType } from "../config/constants";
import { IAccount } from "../interfaces";

export const TransactionController = {
  transfer:
    (): RequestHandler =>
    async (req, res, next): Promise<any> => {
      try {
        const userId = res.locals.user.id;
        const {
          amount,
          bank_code,
          bank,
          account_name,
          account_number,
          narration,
          currency,
        } = req.body;

        const user = await knex("users").where({ id: userId }).first();

        if (!user) {
          return res.status(401).json({
            status: "error",
            message: "Invalid user",
          });
        }

        // check if user has enough balance
        const userAccount: IAccount = await knex("accounts")
          .where("user_id", userId)
          .orderBy("updated_at", "desc")
          .first();

        if (!userAccount) {
          return res.status(404).json({
            status: "error",
            message: "User account not found",
          });
        }

        if (parseFloat(userAccount.balance) < parseFloat(amount)) {
          return res.status(400).json({
            status: "error",
            message: "Insufficient balance",
          });
        }

        const transferResponse = await transferFunds({
          amount,
          bank_code,
          bank,
          account_name,
          account_number,
          narration,
          currency,
        });

        if (transferResponse.status === "success") {
          const {
            account_name,
            account_number,
            bank,
            trx_ref,
            status,
            narration,
          } = transferResponse.data;

          const [transactionId] = await knex("transactions").insert({
            user_id: userId,
            type: TransactionType.TRANSFER,
            status,
            amount,
            sender_name: `${user.first_name} ${user.last_name}`,
            sender_account_number: "N/A",
            recipient_account_number: account_number,
            recipient_name: account_name,
            recipient_bank: bank,
            narration,
            trx_ref,
          });

          if (!transactionId) {
            return res.status(400).json({
              status: "error",
              message: "Error creating transaction",
            });
          }

          return res
            .status(200)
            .json({ message: "Transaction initiated successfully" });
        }

        return res.status(400).json({
          status: "error",
          message:
            transferResponse.message.message || "Transaction initiated failed",
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Transfer failed",
          error,
        });
      }
    },

  fetchTransactions:
    (): RequestHandler =>
    async (req, res): Promise<any> => {
      try {
        const { type } = req.query;
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 10; // Default limit of 10
        const offset = (page - 1) * limit;

        let query = knex("transactions")
          .join("users", "transactions.user_id", "users.id")
          .select(
            "transactions.id",
            "transactions.user_id",
            "transactions.type",
            "transactions.amount",
            "transactions.sender_name",
            "transactions.recipient_name",
            "transactions.sender_bank",
            "transactions.narration"
          );

        if (type) {
          query = query.where("transactions.type", type);
        }

        const totalCountQuery = knex("transactions")
          .count("* as total")
          .first();

        if (type) {
          totalCountQuery.where("transactions.type", type);
        }

        const [transactions, totalCount] = await Promise.all([
          query.limit(limit).offset(offset),
          totalCountQuery,
        ]);

        const totalPages = Math.ceil((Number(totalCount?.total) || 0) / limit);

        return res.status(200).json({
          message: "Transactions retrieved successfully",
          currentPage: page,
          totalPages,
          totalTransactions: totalCount?.total || 0,
          data: transactions,
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Error fetching transactions",
          error,
        });
      }
    },
};
