/**
 * @file Assets overview page for monitoring the health and RUL of all assets.
 */

"use client";

import { useState, useEffect } from "react";
import { AssetGrid } from "@/components/dashboard/AssetGrid";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { api } from "@/lib/api";
import { Asset } from "@/lib/types";

/**
 * Renders the assets overview page with status statistics and a grid of asset cards.
 * 
 * @returns {JSX.Element} The rendered assets page.
 */
export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads the list of assets from the API.
     */
    async function loadAssets() {
      try {
        const data = await api.getAssets();
        setAssets(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load assets";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadAssets();
    // Refresh every 30 seconds
    const interval = setInterval(loadAssets, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total: assets.length,
    healthy: assets.filter(a => a.status === "GREEN").length,
    warning: assets.filter(a => a.status === "YELLOW").length,
    critical: assets.filter(a => a.status === "RED").length,
  };

  if (loading && assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">Asset Health</h1>
          <p className="text-sm text-[#94a3b8]">
            Monitor vibration levels and remaining useful life (RUL) of all assets
          </p>
        </div>
        {error && (
          <div className="text-xs text-[#ef4444] bg-[#ef4444]/10 px-3 py-1 rounded border border-[#ef4444]/20">
            Error: {error}
          </div>
        )}
      </div>

      <StatsBar {...stats} />

      {assets.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#334155] rounded-lg">
          <p className="text-[#94a3b8]">No assets detected yet. Start the simulator to see live data.</p>
        </div>
      ) : (
        <AssetGrid assets={assets} />
      )}
    </div>
  );
}
