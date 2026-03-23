"use client";

import { AuditEntry } from "@/lib/types";
import Link from "next/link";

interface AuditTrailTableProps {
  entries: AuditEntry[];
}

export function AuditTrailTable({ entries }: AuditTrailTableProps) {
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="border border-[#334155] rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#334155] bg-[#1e293b]">
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Time</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Action</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Asset</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Technician</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Location</th>
            <th className="px-4 py-3 text-center text-[#94a3b8] font-medium">QR Validated</th>
          </tr>
        </thead>
        <tbody>
          {sortedEntries.map((entry) => (
            <tr key={entry.id} className="border-b border-[#334155] hover:bg-[#1e293b] transition-colors">
              <td className="px-4 py-3 text-[#f1f5f9]">
                {new Date(entry.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                    entry.action === "CHECK_IN" ? "bg-[#22c55e]" : "bg-[#94a3b8]"
                  }`}
                >
                  {entry.action.replace("_", " ")}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/assets/${entry.assetId}`}
                  className="text-[#f1f5f9] hover:text-[#3b82f6]"
                >
                  {entry.assetName}
                </Link>
              </td>
              <td className="px-4 py-3 text-[#94a3b8]">{entry.technicianName}</td>
              <td className="px-4 py-3">
                <a
                  href={`https://maps.google.com/?q=${entry.location.lat},${entry.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3b82f6] hover:underline text-xs"
                >
                  {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}
                </a>
              </td>
              <td className="px-4 py-3 text-center">
                {entry.qrValidated ? (
                  <span className="inline-flex items-center gap-1 text-[#22c55e]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#ef4444]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedEntries.length === 0 && (
        <div className="p-8 text-center text-[#94a3b8]">
          No audit entries yet
        </div>
      )}
    </div>
  );
}
