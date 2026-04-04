/**
 * @file Alerts page for monitoring real-time alerts from asset monitoring.
 */

"use client";

import { useState, useEffect } from "react";
import { AlertList } from "@/components/dashboard/AlertList";
import { api } from "@/lib/api";

/**
 * Renders the alerts page with a filterable list of real-time alerts.
 * 
 * @returns {JSX.Element} The rendered alerts page.
 */
export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads the list of alerts from the API.
     */
    async function loadAlerts() {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load alerts";
        console.error("Failed to load alerts", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading && alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">Alerts</h1>
          <p className="text-sm text-[#94a3b8]">
            Real-time alerts from asset monitoring
          </p>
        </div>
        {error && (
          <div className="text-xs text-[#ef4444] bg-[#ef4444]/10 px-3 py-1 rounded border border-[#ef4444]/20">
            Error: {error}
          </div>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#334155] rounded-lg">
          <p className="text-[#94a3b8]">No active alerts. All systems operational.</p>
        </div>
      ) : (
        <AlertList alerts={alerts} />
      )}
    </div>
  );
}
