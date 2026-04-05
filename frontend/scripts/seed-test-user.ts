/**
 * @fileoverview Seed script to create a test user for E2E tests in PostgreSQL.
 * Run this before running e2e tests to ensure a user exists.
 */

import { Pool } from "pg";
import crypto from "crypto";

const databaseUrl = process.env.DATABASE_URL || "postgres://precognito_user:precognito_password@localhost:5432/precognito";
const pool = new Pool({ connectionString: databaseUrl });

async function seed() {
  console.log("Seeding test user...");

  const testEmail = "admin@precognito.ai";
  const testPassword = "Password123!";
  const userName = "Admin User";

  const client = await pool.connect();

  try {
    // Delete existing user if any
    console.log("Cleaning up existing test user...");
    await client.query('DELETE FROM session WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [testEmail]);
    await client.query('DELETE FROM account WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [testEmail]);
    await client.query('DELETE FROM "user" WHERE email = $1', [testEmail]);

    // Generate IDs
    const userId = crypto.randomUUID();
    const accountId = crypto.randomUUID();
    const now = new Date();

    // Insert user
    console.log("Creating user...");
    await client.query(`
      INSERT INTO "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt", role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [userId, userName, testEmail, false, null, now, now, "ADMIN"]);

    // Generate password hash using better-auth's scrypt format
    // Format: <salt>:<hash> (both in hex)
    console.log("Generating password hash...");
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(testPassword, salt, 32, { 
      N: 16384, 
      r: 8, 
      p: 1 
    });
    const passwordHash = `${salt}:${derivedKey.toString("hex")}`;

    // Insert account with password
    console.log("Creating account with password...");
    await client.query(`
      INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [accountId, userId, "credential", userId, passwordHash, now, now]);

    console.log("Test user created successfully!");
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}`);
    console.log(`  Role: ADMIN`);
  } catch (err) {
    console.error("Error seeding user:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();