/**
 * @fileoverview Create a session for E2E testing.
 * This script creates a session directly in the database.
 */

import { Database } from "bun:sqlite";
import crypto from "crypto";

const db = new Database("./precognito.sqlite");

const userEmail = "admin@precognito.in";
const user = db.query("SELECT id FROM user WHERE email = ?").get(userEmail) as { id: string } | undefined;

if (!user) {
  console.error("User not found");
  process.exit(1);
}

// Delete existing sessions
db.query("DELETE FROM session WHERE userId = ?").run(user.id);

// Create new session
const sessionId = crypto.randomUUID();
const token = crypto.randomUUID();
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

db.query(`
  INSERT INTO session (id, userId, expiresAt, token, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(sessionId, user.id, expiresAt, token, new Date().toISOString(), new Date().toISOString());

console.log(token);