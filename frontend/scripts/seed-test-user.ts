/**
 * @fileoverview Seed script to create a test user for E2E tests.
 * Run this before running e2e tests to ensure a user exists.
 */

import { Database } from "bun:sqlite";
import crypto from "crypto";

const dbPath = "./precognito.sqlite";
const db = new Database(dbPath);

async function seed() {
  console.log("Seeding test user...");
  
  const testEmail = "admin@precognito.in";
  const testPassword = "TestPassword123!";
  const userName = "Admin";
  
  // Delete existing user if any
  console.log("Cleaning up existing test user...");
  try {
    db.query("DELETE FROM session WHERE userId IN (SELECT id FROM user WHERE email = ?)")
      .run(testEmail);
  } catch {}
  try {
    db.query("DELETE FROM account WHERE userId IN (SELECT id FROM user WHERE email = ?)")
      .run(testEmail);
  } catch {}
  try {
    db.query("DELETE FROM user WHERE email = ?").run(testEmail);
  } catch {}

  // Generate IDs
  const userId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert user
  console.log("Creating user...");
  db.query(`
    INSERT INTO user (id, name, email, emailVerified, image, createdAt, updatedAt, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, userName, testEmail, 0, null, now, now, "ADMIN");

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
  db.query(`
    INSERT INTO account (id, accountId, providerId, userId, password, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(accountId, userId, "credential", userId, passwordHash, now, now);

  console.log("Test user created successfully!");
  console.log(`  Email: ${testEmail}`);
  console.log(`  Password: ${testPassword}`);
  console.log(`  Role: ADMIN`);
}

seed();