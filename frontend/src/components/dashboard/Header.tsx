"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, roleColors } from "@/lib/authContext";
import { mockThermalAlerts } from "@/lib/mockData";

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const unacknowledgedAlerts = mockThermalAlerts.filter((a) => !a.acknowledged).length;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user) return null;

  return (
    <header
      className="h-14 px-4 flex items-center justify-between border-b border-[#334155]"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="font-semibold text-[#f1f5f9]">
          Precognito
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {unacknowledgedAlerts > 0 && (
          <Link
            href="/ehs"
            className="relative p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-[#ef4444] text-white text-[10px] font-bold rounded-full">
              {unacknowledgedAlerts}
            </span>
          </Link>
        )}

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: roleColors[user.role] }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm text-[#f1f5f9]">{user.name}</p>
              <p className="text-xs text-[#94a3b8]">{user.role.replace(/_/g, " ")}</p>
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
