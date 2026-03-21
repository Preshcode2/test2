import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

// Supabase requires SSL in production
const sslConfig = process.env.NODE_ENV === "production"
  ? { ssl: { rejectUnauthorized: false } }
  : {};

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ...sslConfig,
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
