"use client";

import Link from "next/link";
import { ThermalAlert } from "@/lib/types";

interface ThermalAlertCardProps {
  alert: ThermalAlert;
  onAcknowledge?: (id: string) => void;
}

export function ThermalAlertCard({ alert, onAcknowledge }: ThermalAlertCardProps) {
  const tempDiff = alert.currentTemp - alert.baselineTemp;
  const isCritical = alert.severity === "CRITICAL";

  return (
    <div
      className={`border rounded-lg p-4 bg-[#1e293b] ${
        isCritical ? "border-[#ef4444]" : "border-[#eab308]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isCritical ? "bg-[#ef4444] animate-pulse" : "bg-[#eab308]"
            }`}
          />
          <span
            className={`px-2 py-0.5 rounded text-xs text-white ${
              isCritical ? "bg-[#ef4444]" : "bg-[#eab308]"
            }`}
          >
            {alert.severity}
          </span>
        </div>
        <Link
          href={`/assets/${alert.assetId}`}
          className="text-sm text-[#3b82f6] hover:underline"
        >
          View Asset
        </Link>
      </div>

      <h4 className="text-[#f1f5f9] font-medium mb-2">
        <Link href={`/assets/${alert.assetId}`} className="hover:text-[#3b82f6]">
          {alert.assetName}
        </Link>
      </h4>

      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-xs text-[#94a3b8]">Current</p>
          <p className="text-lg font-bold" style={{ color: isCritical ? "#ef4444" : "#eab308" }}>
            {alert.currentTemp}°C
          </p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Baseline</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{alert.baselineTemp}°C</p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Duration</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{alert.durationMinutes}m</p>
        </div>
      </div>

      <div className="p-2 rounded bg-[#0f172a] mb-3">
        <p className="text-xs text-[#94a3b8]">
          Temperature exceeded baseline by{" "}
          <span className="text-[#f1f5f9] font-medium">+{tempDiff}°C</span> for{" "}
          <span className="text-[#f1f5f9] font-medium">{alert.durationMinutes} minutes</span>
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#94a3b8]">
          {new Date(alert.timestamp).toLocaleString()}
        </p>
        {alert.acknowledged ? (
          <span className="text-xs text-[#22c55e]">
            Acknowledged by {alert.acknowledgedBy}
          </span>
        ) : (
          <button
            onClick={() => onAcknowledge?.(alert.id)}
            className="px-3 py-1 text-xs bg-[#22c55e] text-white rounded hover:bg-[#16a34a] transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}
