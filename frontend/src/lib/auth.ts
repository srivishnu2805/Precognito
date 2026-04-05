/**
 * @fileoverview Better Auth server-side configuration.
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

/**
 * Better Auth server configuration with PostgreSQL database.
 */
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL || process.env.NEXT_PUBLIC_DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "TECHNICIAN",
      }
    }
  }
});
