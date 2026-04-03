"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";

// Define roles and permissions here or import from a shared config
export type UserRole = "ADMIN" | "MANAGER" | "OT_SPECIALIST" | "TECHNICIAN" | "STORE_MANAGER";

export const rolePermissions: Record<string, string[]> = {
  ADMIN: ["assets", "alerts", "edge", "reports", "inventory", "work-orders", "executive", "analytics", "ehs", "admin"],
  MANAGER: ["assets", "reports", "executive", "analytics"],
  OT_SPECIALIST: ["assets", "alerts", "edge", "ehs"],
  TECHNICIAN: ["assets", "alerts", "work-orders"],
  STORE_MANAGER: ["inventory"],
};

const allNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assets", label: "Assets" },
  { href: "/alerts", label: "Alerts" },
  { href: "/edge", label: "Edge" },
  { href: "/reports", label: "Reports" },
  { href: "/inventory", label: "Inventory" },
  { href: "/work-orders", label: "Work Orders" },
  { href: "/executive", label: "Executive" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ehs", label: "EHS" },
  { href: "/admin", label: "Admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  // @ts-ignore - custom role field
  const role = user?.role || "TECHNICIAN";
  const allowedPages = rolePermissions[role] || [];
  
  const navItems = allNavItems.filter(
    (item) => item.href === "/dashboard" || allowedPages.includes(item.href.slice(1))
  );

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[248px] border-r border-[#334155] flex flex-col"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="h-14 px-4 flex items-center border-b border-[#334155]">
        <Link href="/dashboard" className="font-semibold text-[#f1f5f9]">
          Precognito
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-[#334155] text-[#f1f5f9]"
                      : "text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#1e293b]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="h-12 px-4 flex items-center border-t border-[#334155]">
        <span className="text-xs text-[#94a3b8]">v0.1.0</span>
      </div>
    </aside>
  );
}
