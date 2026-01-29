import { Pool } from "pg";

export const db = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export async function initDB() {
  await db.query("CREATE EXTENSION IF NOT EXISTS vector;");
  await db.query(`
    CREATE TABLE IF NOT EXISTS meeting_minutes (
      id SERIAL PRIMARY KEY,
      meeting_id TEXT,
      minutes TEXT,
      embedding vector(768),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log("Database initialized with vector extension and meeting_minutes table.");
}
