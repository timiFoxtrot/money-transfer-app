import dotenv from "dotenv";
import { Knex } from "knex";

dotenv.config(); // Load environment variables

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: "/Users/maxuser/Desktop/money-transfer-app/src/migrations",
    },
  },
};

export default config;
