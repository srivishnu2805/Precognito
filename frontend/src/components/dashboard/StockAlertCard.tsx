/**
 * @file StockAlertCard component for displaying just-in-time (JIT) stock alerts.
 */

"use client";

import Link from "next/link";
import { SparePart, Asset } from "@/lib/types";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

interface StockAlertCardProps {
  part: SparePart;
}

/**
 * Renders an alert card for a spare part with low stock relative to asset RUL.
 * 
 * @param {StockAlertCardProps} props The component props.
 * @param {SparePart} props.part The spare part data.
 * @returns {JSX.Element} The rendered stock alert card.
 */
export function StockAlertCard({ part }: StockAlertCardProps) {
  const [asset, setAsset] = useState<Asset | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      if (part.assetId) {
        try {
          const assets = await api.getAssets();
          const found = assets.find((a: Asset) => a.id === part.assetId);
          setAsset(found || null);
        } catch {
          setAsset(null);
        }
      }
    }
    fetchAsset();
  }, [part.assetId]);

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
