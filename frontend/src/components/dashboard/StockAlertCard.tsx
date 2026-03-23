"use client";

import Link from "next/link";
import { SparePart } from "@/lib/types";
import { mockAssets } from "@/lib/mockData";

interface StockAlertCardProps {
  part: SparePart;
}

export function StockAlertCard({ part }: StockAlertCardProps) {
  const asset = part.assetId ? mockAssets.find((a) => a.id === part.assetId) : null;
  const thresholdHours = part.leadTimeDays * 24 * 1.1;

  return (
    <div className="border border-[#ef4444] rounded-lg p-4 bg-[#1e293b]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse" />
            <span className="text-sm font-medium text-[#ef4444]">JIT Alert</span>
          </div>
          <h4 className="text-[#f1f5f9] font-medium mb-1">{part.name}</h4>
          <p className="text-sm text-[#94a3b8] mb-2">{part.partNumber}</p>
          {asset && (
            <Link
              href={`/assets/${asset.id}`}
              className="text-sm text-[#3b82f6] hover:underline"
            >
              {asset.name} - RUL: {asset.rul}h
            </Link>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-[#94a3b8]">Lead Time + 10%</p>
          <p className="text-lg font-semibold text-[#ef4444]">{Math.round(thresholdHours)}h</p>
          <p className="text-xs text-[#94a3b8] mt-1">Current Stock: {part.stockLevel}</p>
        </div>
      </div>
    </div>
  );
}
