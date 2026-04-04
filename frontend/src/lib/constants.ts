/**
 * @fileoverview Application-wide constants and role-based configurations.
 */

/**
 * Possible user roles in the application.
 */
export type UserRole = "ADMIN" | "MANAGER" | "OT_SPECIALIST" | "TECHNICIAN" | "STORE_MANAGER";

/**
 * Color mapping for each user role, primarily for UI display.
 */
export const roleColors: Record<UserRole, string> = {
  ADMIN: "#ef4444",
  MANAGER: "#8b5cf6",
  OT_SPECIALIST: "#3b82f6",
  TECHNICIAN: "#22c55e",
  STORE_MANAGER: "#eab308",
};

/**
 * Permission mapping for each user role, defining accessible modules.
 */
export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ["assets", "alerts", "edge", "reports", "inventory", "work-orders", "executive", "analytics", "ehs", "admin"],
  MANAGER: ["assets", "reports", "executive", "analytics"],
  OT_SPECIALIST: ["assets", "alerts", "edge", "ehs"],
  TECHNICIAN: ["assets", "alerts", "work-orders"],
  STORE_MANAGER: ["inventory"],
};

/**
 * Safely extracts the user role from a better-auth session user object.
 * Handles the known type inference issue with custom additionalFields.
 * 
 * @param user - The user object from the session (may be undefined/null)
 * @returns The user's role, defaulting to TECHNICIAN
 */
export function getUserRole(user: unknown): UserRole {
  if (!user || typeof user !== "object") {
    return "TECHNICIAN";
  }
  const u = user as { role?: unknown };
  if (typeof u.role === "string" && isValidRole(u.role)) {
    return u.role;
  }
  return "TECHNICIAN";
}

function isValidRole(value: string): value is UserRole {
  return ["ADMIN", "MANAGER", "OT_SPECIALIST", "TECHNICIAN", "STORE_MANAGER"].includes(value);
}
