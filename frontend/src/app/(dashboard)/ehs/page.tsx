/**
 * @fileoverview Environmental Health and Safety (EHS) page for thermal monitoring.
 * This module tracks asset temperatures, manages thermal safety alerts, 
 * and provides visualization of temperature trends for safety compliance.
 */

"use client";

import { useState, useEffect } from "react";
import { mockTemperatureTrends } from "@/lib/mockData";
import { ThermalAlertCard } from "@/components/dashboard/ThermalAlertCard";
import { ThermalTrendChart } from "@/components/dashboard/ThermalTrendChart";
import { ThermalAlert, Asset } from "@/lib/types";
import { api } from "@/lib/api";

/**
 * EHSPage component for plant-wide thermal safety oversight.
 * 
 * @returns {JSX.Element} The rendered EHS safety dashboard.
 */
export default function EHSPage() {
  const [alerts, setAlerts] = useState<ThermalAlert[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Loads EHS-related safety alerts and asset data.
     */
    async function loadEHSData() {
      try {
        const [alertsData, assetsData] = await Promise.all([
          api.getSafetyAlerts(),
          api.getAssets()
        ]);
        setAlerts(alertsData);
        setAssets(assetsData);
      } catch (err) {
        console.error("Failed to load EHS data", err);
      } finally {
        setLoading(false);
      }
    }
    loadEHSData();
    const interval = setInterval(loadEHSData, 15000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Handles the acknowledgment of a thermal safety alert.
   * 
   * @param {string} alertId The ID of the alert to acknowledge.
   */
  const handleAcknowledge = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledgedBy: "EHS Officer",
              acknowledgedAt: new Date().toISOString(),
            }
          : a
      )
    );
  };

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading safety data...</div>
      </div>
    );
  }

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter((a) => a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter((a) => a.severity === "CRITICAL").length;
  const warningCount = unacknowledgedAlerts.filter((a) => a.severity === "WARNING").length;

  const assetsWithTrends = assets.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">EHS Thermal Safety</h1>
        <div className="flex items-center gap-4 text-sm">
          {criticalCount > 0 && (
            <span className="px-2 py-1 rounded bg-[#ef4444]/20 text-[#ef4444]">
              {criticalCount} Critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-1 rounded bg-[#eab308]/20 text-[#eab308]">
              {warningCount} Warning
            </span>
          )}
          {criticalCount === 0 && warningCount === 0 && (
            <span className="px-2 py-1 rounded bg-[#22c55e]/20 text-[#22c55e]">
              All Clear
            </span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[#0f172a] border border-[#334155]">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-[#ef4444] flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-[#f1f5f9] mb-1">
              Temperature Safety Monitoring
            </h3>
            <p className="text-sm text-[#94a3b8]">
              Alerts are triggered when temperature exceeds baseline for more than 5 minutes.
              Safe operating range: 40-70°C. Critical threshold: &gt;70°C.
            </p>
          </div>
        </div>
      </div>

      {unacknowledgedAlerts.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">
            Unacknowledged Safety Alerts ({unacknowledgedAlerts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unacknowledgedAlerts.map((alert) => (
              <ThermalAlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">
          Active Thermal Trends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assetsWithTrends.length === 0 ? (
            <div className="col-span-2 text-center py-10 border border-dashed border-[#334155] rounded-lg">
              <p className="text-[#64748b]">No asset data available for trend analysis.</p>
            </div>
          ) : (
            assetsWithTrends.map((asset) => {
              const alert = alerts.find((a) => a.assetId === asset.id);
              return (
                <ThermalTrendChart
                  key={asset.id}
                  data={mockTemperatureTrends[asset.id] || []}
                  assetName={asset.name}
                  baselineTemp={alert?.baselineTemp || 60}
                  criticalTemp={70}
                />
              );
            })
          )}
        </div>
      </section>

      {acknowledgedAlerts.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">
            Recently Acknowledged ({acknowledgedAlerts.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acknowledgedAlerts.map((alert) => (
              <ThermalAlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
        <h3 className="text-sm font-medium text-[#94a3b8] mb-4">Safety Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Total Alerts</p>
            <p className="text-2xl font-bold text-[#f1f5f9]">{alerts.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Critical</p>
            <p className="text-2xl font-bold text-[#ef4444]">
              {alerts.filter((a) => a.severity === "CRITICAL").length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Warning</p>
            <p className="text-2xl font-bold text-[#eab308]">
              {alerts.filter((a) => a.severity === "WARNING").length}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Acknowledged</p>
            <p className="text-2xl font-bold text-[#22c55e]">{acknowledgedAlerts.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
