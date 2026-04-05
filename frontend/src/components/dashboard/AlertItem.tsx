/**
 * @file AlertItem component for displaying individual alert details.
 */

"use client";

import { Alert } from "@/lib/types";

interface AlertItemProps {
  alert: Alert;
}

const severityConfig: Record<Alert["severity"], { color: string; bg: string; label: string }> = {
  CRITICAL: { color: "text-white", bg: "bg-[#ef4444]", label: "Critical" },
  HIGH: { color: "text-black", bg: "bg-[#f97316]", label: "High" },
  MEDIUM: { color: "text-black", bg: "bg-[#eab308]", label: "Medium" },
  LOW: { color: "text-white", bg: "bg-[#22c55e]", label: "Low" },
};

/**
 * Formats a ISO timestamp into a relative time string (e.g., "5 min ago").
 * 
 * @param {string} timestamp The ISO timestamp string.
 * @returns {string} The formatted relative time string.
 */
function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const alertTime = new Date(timestamp);
  const diffMs = now.getTime() - alertTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

/**
 * Renders an individual alert item with severity styling and asset info.
 * 
 * @param {AlertItemProps} props The component props.
 * @param {Alert} props.alert The alert object to display.
 * @returns {JSX.Element} The rendered alert item.
 */
export function AlertItem({ alert }: AlertItemProps) {
  const config = severityConfig[alert.severity] || severityConfig.LOW;

  return (
    <div className="border border-[#334155] rounded-lg bg-[#1e293b] p-4 hover:bg-[#334155] transition-colors">
      <div className="flex items-start gap-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#f1f5f9]">{alert.assetName}</p>
          <p className="text-sm text-[#94a3b8] mt-1">{alert.message}</p>
          <p className="text-xs text-[#64748b] mt-2">{formatTimeAgo(alert.timestamp)}</p>
        </div>
      </div>
    </div>
  );
}
