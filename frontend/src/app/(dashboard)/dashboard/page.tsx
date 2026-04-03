"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
  mockAssets, 
  mockAlerts, 
  mockWorkOrders, 
  mockThermalAlerts, 
  mockSpareParts 
} from "@/lib/mockData";
import Link from "next/link";

export const rolePermissions: Record<string, string[]> = {
  ADMIN: ["assets", "alerts", "edge", "reports", "inventory", "work-orders", "executive", "analytics", "ehs", "admin"],
  MANAGER: ["assets", "reports", "executive", "analytics"],
  OT_SPECIALIST: ["assets", "alerts", "edge", "ehs"],
  TECHNICIAN: ["assets", "alerts", "work-orders"],
  STORE_MANAGER: ["inventory"],
};

export const roleColors: Record<string, string> = {
  ADMIN: "#ef4444",
  MANAGER: "#8b5cf6",
  OT_SPECIALIST: "#3b82f6",
  TECHNICIAN: "#22c55e",
  STORE_MANAGER: "#eab308",
};

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  // @ts-ignore
  const role = user.role || "TECHNICIAN";
  const allowedPages = rolePermissions[role] || [];
  
  const stats = {
    totalAssets: mockAssets.length,
    healthy: mockAssets.filter((a) => a.status === "GREEN").length,
    warning: mockAssets.filter((a) => a.status === "YELLOW").length,
    critical: mockAssets.filter((a) => a.status === "RED").length,
    alerts: mockAlerts.length,
    thermalAlerts: mockThermalAlerts.filter((a) => !a.acknowledged).length,
    workOrders: mockWorkOrders.filter((wo) => wo.status !== "COMPLETED").length,
    lowStock: mockSpareParts.filter((p) => p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK").length,
  };

  const recentAlerts = [...mockAlerts, ...mockThermalAlerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const quickLinks = allowedPages
    .filter((page) => !["dashboard", "admin"].includes(page))
    .map((page) => ({
      href: `/${page}`,
      label: page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " "),
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9]">Welcome back, {user.name}</h1>
          <p className="text-sm text-[#94a3b8]">
            <span
              className="inline-block px-2 py-0.5 rounded text-xs text-white"
              style={{ backgroundColor: roleColors[role] }}
            >
              {role.replace(/_/g, " ")}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Total Assets</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">{stats.totalAssets}</p>
        </div>
        <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Alerts</p>
          <p className="text-2xl font-bold text-[#eab308]">{stats.alerts + stats.thermalAlerts}</p>
        </div>
        <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Critical</p>
          <p className="text-2xl font-bold text-[#ef4444]">{stats.critical}</p>
        </div>
        {allowedPages.includes("work-orders") && (
          <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-xs text-[#94a3b8] mb-1">Pending Work</p>
            <p className="text-2xl font-bold text-[#3b82f6]">{stats.workOrders}</p>
          </div>
        )}
      </div>

      {recentAlerts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-medium text-[#f1f5f9]">Recent Alerts</h2>
            {allowedPages.includes("alerts") && (
              <Link href="/alerts" className="text-sm text-[#3b82f6] hover:underline">
                View All →
              </Link>
            )}
          </div>
          <div className="border border-[#334155] rounded-lg overflow-hidden">
            {recentAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                className={`p-4 flex items-center justify-between ${
                  idx < recentAlerts.length - 1 ? "border-b border-[#334155]" : ""
                }`}
                style={{ backgroundColor: "#1e293b" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      "severity" in alert && (alert.severity === "CRITICAL" || alert.severity === "HIGH")
                        ? "bg-[#ef4444]"
                        : "bg-[#eab308]"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-[#f1f5f9]">{"assetName" in alert ? alert.assetName : `Thermal Alert`}</p>
                    <p className="text-xs text-[#94a3b8]">{"message" in alert ? alert.message : `Temperature: ${"currentTemp" in alert ? alert.currentTemp : 0}°C`}</p>
                  </div>
                </div>
                <span className="text-xs text-[#64748b]">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Quick Actions</h2>
          <div className="space-y-2">
            {allowedPages.includes("assets") && (
              <Link
                href="/assets"
                className="flex items-center gap-3 p-3 border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <span className="text-sm text-[#f1f5f9]">View All Assets</span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
