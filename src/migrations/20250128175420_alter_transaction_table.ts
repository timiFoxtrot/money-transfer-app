import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.string("sender_name").notNullable().defaultTo("");
    table.string("sender_account_number").notNullable().defaultTo("");
    table.string("user_account_number").notNullable().defaultTo("");
    table.string("sender_bank").notNullable().defaultTo("");
    table.text("narration").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("transactions", (table) => {
    table.dropColumn("sender_name");
    table.dropColumn("sender_account_number");
    table.dropColumn("user_account_number");
    table.dropColumn("sender_bank");
    table.dropColumn("narration");
  });
}
