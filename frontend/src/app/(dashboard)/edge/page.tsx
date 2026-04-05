/**
 * @file Edge Status page for monitoring sensor connectivity and heartbeat status.
 */

"use client";

import { useState, useEffect } from "react";
import { SensorTable } from "@/components/dashboard/SensorTable";
import { api } from "@/lib/api";
import { SensorStatus } from "@/lib/types";

/**
 * Renders the edge status page with a table of sensors and their connectivity state.
 * 
 * @returns {JSX.Element} The rendered edge status page.
 */
export default function EdgePage() {
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Loads the sensor heartbeat data and maps it to the UI status type.
     */
    async function loadHeartbeats() {
      try {
        const data = await api.getHeartbeats();
        
        // Map backend heartbeats to SensorStatus type
        const mappedSensors: SensorStatus[] = data.map((hb: import("@/lib/api").HeartbeatResponse) => ({
          sensorId: hb.deviceId,
          name: hb.deviceId.split("_").map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
          status: hb.status === "Active" ? "ONLINE" : "OFFLINE",
          lastHeartbeat: hb.lastSeen,
          batteryLevel: 85 // Mocked as we don't have battery telemetry yet
        }));
        
        setSensors(mappedSensors);
      } catch (err) {
        console.error("Failed to load heartbeats", err);
      } finally {
        setLoading(false);
      }
    }

    loadHeartbeats();
    const interval = setInterval(loadHeartbeats, 2000); // 2s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && sensors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading sensor status...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">Edge Status</h1>
          <p className="text-sm text-[#94a3b8]">
            Monitor sensor connectivity and heartbeat status
          </p>
        </div>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
            <span className="text-[#94a3b8]">Online: {sensors.filter(s => s.status === "ONLINE").length}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="text-[#94a3b8]">Offline: {sensors.filter(s => s.status === "OFFLINE").length}</span>
          </div>
        </div>
      </div>

      {sensors.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#334155] rounded-lg">
          <p className="text-[#94a3b8]">No edge devices detected yet.</p>
        </div>
      ) : (
        <SensorTable sensors={sensors} />
      )}
    </div>
  );
}
