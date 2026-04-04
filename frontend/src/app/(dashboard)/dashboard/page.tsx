/**
 * @fileoverview Main landing page for the dashboard area.
 * This module provides a high-level summary of plant health, recent alerts, 
 * and quick access to various system modules based on user roles.
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Asset, Alert } from "@/lib/types";
import Link from "next/link";
import { rolePermissions, roleColors, getUserRole } from "@/lib/constants";

/**
 * DashboardPage component for general system oversight and navigation.
 * 
 * @returns {JSX.Element|null} The rendered dashboard page or null if not authenticated.
 */
export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    /**
     * Loads high-level dashboard metrics and alerts.
     */
    async function loadDashboardData() {
      try {
        const [assetsData, alertsData] = await Promise.all([
          api.getAssets(),
          api.getAlerts()
        ]);
        setAssets(assetsData);
        setRecentAlerts(alertsData.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      loadDashboardData();
      const interval = setInterval(loadDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  if (isPending || (loading && assets.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading dashboard...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const role = getUserRole(user);
  const allowedPages = rolePermissions[role] || [];
  
  const stats = {
    totalAssets: assets.length,
    healthy: assets.filter((a) => a.status === "GREEN").length,
    warning: assets.filter((a) => a.status === "YELLOW").length,
    critical: assets.filter((a) => a.status === "RED").length,
  };

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
          <p className="text-xs text-[#94a3b8] mb-1">Healthy</p>
          <p className="text-2xl font-bold text-[#22c55e]">{stats.healthy}</p>
        </div>
        <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Warning</p>
          <p className="text-2xl font-bold text-[#eab308]">{stats.warning}</p>
        </div>
        <div className="border border-[#334155] rounded-lg p-4" style={{ backgroundColor: "#1e293b" }}>
          <p className="text-xs text-[#94a3b8] mb-1">Critical</p>
          <p className="text-2xl font-bold text-[#ef4444]">{stats.critical}</p>
        </div>
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
                      alert.severity === "CRITICAL" || alert.severity === "HIGH"
                        ? "bg-[#ef4444]"
                        : "bg-[#eab308]"
                    }`}
                  />
                  <div>
                    <p className="text-sm text-[#f1f5f9]">{alert.assetName} Alert</p>
                    <p className="text-xs text-[#94a3b8]">{alert.message}</p>
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
            {allowedPages.includes("alerts") && (
              <Link
                href="/alerts"
                className="flex items-center gap-3 p-3 border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
                style={{ backgroundColor: "#1e293b" }}
              >
                <span className="text-sm text-[#f1f5f9]">View Active Alerts</span>
              </Link>
            )}
          </div>
        </section>

        {stats.critical > 0 && (
          <section className="p-4 border border-[#ef4444]/30 rounded-lg bg-[#ef4444]/5">
            <h2 className="text-lg font-medium text-[#ef4444] mb-2">Critical Attention Required</h2>
            <p className="text-sm text-[#94a3b8] mb-4">
              {stats.critical} asset(s) are currently in critical state and require immediate maintenance.
            </p>
            <Link
              href="/assets"
              className="inline-block px-4 py-2 bg-[#ef4444] text-white text-sm font-medium rounded hover:bg-[#dc2626] transition-colors"
            >
              Review Critical Assets
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
