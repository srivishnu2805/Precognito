"use client";

import { useState, useEffect } from "react";
import { ThermalAlert } from "@/lib/types";
import Link from "next/link";

interface NotificationBellProps {
  alerts: ThermalAlert[];
}

export function NotificationBell({ alerts }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [recentAlerts, setRecentAlerts] = useState<ThermalAlert[]>([]);

  useEffect(() => {
    const unacknowledged = alerts.filter((a) => !a.acknowledged).slice(0, 5);
    setRecentAlerts(unacknowledged);
  }, [alerts]);

  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-[#ef4444] text-white text-xs font-bold rounded-full animate-pulse">
            {unacknowledgedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-3 border-b border-[#334155] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#f1f5f9]">
                Thermal Alerts
              </h3>
              <Link
                href="/ehs"
                className="text-xs text-[#3b82f6] hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View All
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recentAlerts.length > 0 ? (
                recentAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={`/assets/${alert.assetId}`}
                    className="block p-3 border-b border-[#334155] last:border-0 hover:bg-[#0f172a] transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`w-2 h-2 mt-1.5 rounded-full ${
                          alert.severity === "CRITICAL"
                            ? "bg-[#ef4444]"
                            : "bg-[#eab308]"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#f1f5f9] truncate">
                          {alert.assetName}
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          {alert.currentTemp}°C (+{alert.currentTemp - alert.baselineTemp}°C) -{" "}
                          {alert.durationMinutes}m
                        </p>
                        <p className="text-xs text-[#64748b] mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-[#94a3b8] text-sm">
                  No unacknowledged alerts
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
