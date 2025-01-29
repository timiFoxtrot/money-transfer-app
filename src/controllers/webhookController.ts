import { RequestHandler } from "express";
import knex from "../models/knex";
import { TransactionStatus, TransactionType } from "../config/constants";

export const WebhookController = {
  receiveFunds:
    (): RequestHandler =>
    async (req, res): Promise<any> => {
      const trx = await knex.transaction(); // Start a transaction

      try {
        const webhook_secret = process.env.WEBHOOK_SECRET;
        const {
          type,
          amount,
          secret,
          source,
          account_number,
          trx_ref,
          status,
        } = req.body;

        if (secret !== webhook_secret) {
          await trx.rollback();
          return res.status(400).json({ message: "Invalid webhook secret" });
        }

        if (type === "collection") {
          const accountUser = await trx("accounts")
            .join("users", "accounts.user_id", "=", "users.id")
            .select(
              "accounts.id",
              "users.id as user_id",
              "users.first_name",
              "users.last_name",
              "users.email",
              "accounts.account_number",
              "accounts.balance"
            )
            .where("accounts.account_number", account_number)
            .first();

          if (!accountUser) {
            await trx.rollback();
            return res.status(401).json({
              status: "error",
              message: "User account not found",
            });
          }
          const [transactionId] = await trx("transactions").insert({
            user_id: accountUser.user_id,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.SUCCESSFUL,
            amount,
            sender_name: source?.sender || "N/A",
            sender_account_number: source?.account_number || "N/A",
            recipient_account_number: account_number,
            recipient_name: `${accountUser.first_name} ${accountUser.last_name}`,
            sender_bank: source?.bank || "N/A",
            narration: source?.narration || "N/A",
          });

          if (!transactionId) {
            await trx.rollback();
            return res.status(400).json({
              status: "error",
              message: "Error saving transaction",
            });
          }

          const newBalance =
            parseFloat(accountUser.balance) + parseFloat(amount);

          const updatedAccount = await trx("accounts")
            .where("id", accountUser.id)
            .update({ balance: newBalance, updated_at: trx.fn.now() });

          if (!updatedAccount) {
            await trx.rollback();
            return res.status(400).json({
              status: "error",
              message: "Failed to update account balance",
            });
          }

          await trx.commit();
          return res.status(200).json({ message: "Received successfully" });
        }

        if (type === "transfer") {
          const initiatedTransaction = await trx("transactions")
            .select("transactions.user_id")
            .where("trx_ref", trx_ref)
            .first();

          if (!initiatedTransaction) {
            return res.status(400).json({
              status: "error",
              message: "Initiated transaction not found",
            });
          }

          const userAccount = await trx("accounts")
            .select("accounts.id", "accounts.balance")
            .where("user_id", initiatedTransaction.user_id)
            .orderBy("updated_at", "desc")
            .first();

          if (!userAccount) {
            return res.status(400).json({
              status: "error",
              message: "User account not found",
            });
          }
          const updatedTransaction = await trx("transactions")
            .where("trx_ref", trx_ref)
            .update({ status });

          if (!updatedTransaction) {
            await trx.rollback();
            return res.status(400).json({
              status: "error",
              message: "Failed to update transaction",
            });
          }

          if (status === TransactionStatus.SUCCESSFUL) {
            const newBalance =
              parseFloat(userAccount.balance) - parseFloat(amount);

            if (newBalance < 0) {
              await trx.rollback();
              return res.status(400).json({
                status: "error",
                message: "Insufficient balance",
              });
            }

            const updatedAccount = await trx("accounts")
              .where("id", userAccount.id)
              .update({ balance: newBalance, updated_at: trx.fn.now() });

            if (!updatedAccount) {
              await trx.rollback();
              return res.status(400).json({
                status: "error",
                message: "Failed to update account balance",
              });
            }
          }

          await trx.commit();
          return res
            .status(200)
            .json({ message: "Transfer processed successfully" });
        }

        await trx.rollback();
        return res.status(400).json({ message: "Invalid webhook data" });
      } catch (error: any) {
        await trx.rollback();
        console.error("Webhook processing failed:", error);
        return res.status(500).json({
          status: "error",
          message: "Error processing webhook",
          error: error.message,
        });
      }
    },
};
