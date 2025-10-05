import pgPromise from "pg-promise";
import dotenv from "dotenv";
dotenv.config();

const pgp = pgPromise();
const cn = {
    host: "aws-1-eu-west-2.pooler.supabase.com",
    port: 5432,
    database: "postgres",
    user: "postgres.qwrfahrgrzhdneoaddho",
    password: process.env.DB_PASSWORD,
};

const db = pgp(cn);

export { db };
