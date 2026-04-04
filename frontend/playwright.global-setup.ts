/**
 * @fileoverview Playwright global setup for E2E tests.
 * This script seeds a test user and creates a session for authentication.
 */

import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const AUTH_FILE_PATH = path.join(process.cwd(), "playwright", ".auth", "user.json");

export default async function globalSetup() {
  console.log("Starting global setup for E2E tests...");

  // Ensure auth directory exists
  const authDir = path.dirname(AUTH_FILE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Delete existing auth file
  if (fs.existsSync(AUTH_FILE_PATH)) {
    fs.unlinkSync(AUTH_FILE_PATH);
  }

  // Run seed script to create user
  console.log("Creating test user...");
  try {
    execSync("bun run scripts/seed-test-user.ts", { 
      cwd: process.cwd(), 
      stdio: "pipe",
      timeout: 30000 
    });
    console.log("User created");
  } catch (e) {
    console.log("User might already exist, continuing...");
  }

  // Run create session script
  console.log("Creating session...");
  let token: string | null = null;
  try {
    const output = execSync("bun run scripts/create-session.ts", { 
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: "pipe",
      timeout: 30000
    });
    token = output.trim();
    console.log("Session created");
  } catch (e) {
    console.error("Failed to create session:", e);
  }

  // The session is now in the database - the cookie will be set when we navigate
  // We don't need to create cookies here since better-auth handles session 
  // via API calls, not cookies in the traditional sense

  console.log("Global setup complete!");
}