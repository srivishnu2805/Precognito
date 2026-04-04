"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { NotificationBell } from "./NotificationBell";
import { roleColors, getUserRole } from "@/lib/constants";
import { useTheme } from "@/lib/ThemeContext";

/**
 * Header component for the dashboard layout.
 * Displays the application logo, notifications, theme toggle, and user profile dropdown.
 * 
 * @returns {JSX.Element} The rendered header.
 */
export function Header() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const user = session?.user;
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  /**
   * Handles user logout and redirection to the login page.
   */
  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (!user) return null;

  const role = getUserRole(user);

  return (
    <header
      className="h-14 px-4 flex items-center justify-between border-b border-[#334155]"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold text-[#f1f5f9]">
          Precognito
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          title={theme === "dark" ? "Switch to High Contrast" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <NotificationBell />

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: roleColors[role] || "#3b82f6" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm text-[#f1f5f9]">{user.name}</p>
              <p className="text-xs text-[#94a3b8]">{role.replace(/_/g, " ")}</p>
            </div>
            <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-[#334155]">
                  <p className="text-sm text-[#f1f5f9]">{user.name}</p>
                  <p className="text-xs text-[#94a3b8]">{user.email}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm text-[#f1f5f9] hover:bg-[#334155] transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#ef4444] hover:bg-[#334155] transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
