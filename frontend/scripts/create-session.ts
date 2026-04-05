/**
 * @fileoverview Create a session for E2E testing in PostgreSQL.
 * This script creates a session directly in the database.
 */

import { Pool } from "pg";
import crypto from "crypto";

const databaseUrl = process.env.DATABASE_URL || "postgres://precognito_user:precognito_password@localhost:5432/precognito";
const pool = new Pool({ connectionString: databaseUrl });

async function createSession() {
  const userEmail = "admin@precognito.ai";

  const client = await pool.connect();

  try {
    const userRes = await client.query('SELECT id FROM "user" WHERE email = $1', [userEmail]);
    const user = userRes.rows[0];

    if (!user) {
      console.error("User not found");
      process.exit(1);
    }

    // Delete existing sessions
    await client.query('DELETE FROM session WHERE "userId" = $1', [user.id]);

    // Create new session
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const now = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await client.query(`
      INSERT INTO session (id, "userId", "expiresAt", token, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [sessionId, user.id, expiresAt, token, now, now]);

    console.log(token);
  } catch (err) {
    console.error("Error creating session:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

createSession();