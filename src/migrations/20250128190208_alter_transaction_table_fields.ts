import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("sender_name").nullable().alter();
    table.string("sender_account_number").nullable().alter();
    table.string("sender_bank").nullable().alter();

    table.dropColumn("user_account_number");

    table.string("recipient_name").nullable();
    table.string("recipient_account_number").nullable();
    table.string("recipient_bank").nullable();
    table.string("trx_ref").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("sender_name").notNullable().alter();
    table.string("sender_account_number").notNullable().alter();
    table.string("sender_bank").notNullable().alter();

    table.string("user_account_number").notNullable();

    table.dropColumn("recipient_name");
    table.dropColumn("recipient_account_number");
    table.dropColumn("recipient_bank");
    table.dropColumn("trx_ref");
  });
}
