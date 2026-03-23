"use client";

import { useAuth, rolePermissions, roleColors } from "@/lib/authContext";
import { mockAssets, mockAlerts, mockWorkOrders, mockThermalAlerts, mockSpareParts } from "@/lib/mockData";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  if (!user || !isLoggedIn) {
    return null;
  }

  const allowedPages = rolePermissions[user.role] || [];
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
              style={{ backgroundColor: roleColors[user.role] }}
            >
              {user.role.replace(/_/g, " ")}
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
        {allowedPages.includes("inventory") && (
          <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
            <p className="text-xs text-[#94a3b8] mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-[#eab308]">{stats.lowStock}</p>
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
                <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm text-[#f1f5f9]">View All Assets</span>
              </Link>
            )}
            {allowedPages.includes("reports") && (
              <Link
                href="/reports"
                className="flex items-center gap-3 p-3 border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-[#f1f5f9]">Generate Report</span>
              </Link>
            )}
            {allowedPages.includes("inventory") && (
              <Link
                href="/inventory"
                className="flex items-center gap-3 p-3 border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm text-[#f1f5f9]">Check Inventory</span>
              </Link>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Quick Links</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between p-3 border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <span className="text-sm text-[#f1f5f9]">{link.label}</span>
                <span className="text-[#3b82f6]">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {allowedPages.includes("executive") && (
        <section className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <h3 className="text-sm font-medium text-[#94a3b8] mb-2">Executive Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#94a3b8]">Healthy Assets</p>
              <p className="text-lg font-bold text-[#22c55e]">{stats.healthy}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Warning</p>
              <p className="text-lg font-bold text-[#eab308]">{stats.warning}</p>
            </div>
            <div>
              <p className="text-xs text-[#94a3b8]">Critical</p>
              <p className="text-lg font-bold text-[#ef4444]">{stats.critical}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
