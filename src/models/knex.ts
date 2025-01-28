import dotenv from "dotenv";
import Knex from "knex";
import knexConfig from "../config/knexfile";

dotenv.config(); // Load environment variables

const knex = Knex(knexConfig.development);

export default knex;
