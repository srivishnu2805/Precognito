import { AssetGrid } from "@/components/dashboard/AssetGrid";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { mockAssets, getAssetStats } from "@/lib/mockData";

export default function AssetsPage() {
  const stats = getAssetStats();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">Asset Health</h1>
        <p className="text-sm text-[#94a3b8]">
          Monitor vibration levels and remaining useful life (RUL) of all assets
        </p>
      </div>

      <StatsBar {...stats} />

      <AssetGrid assets={mockAssets} />
    </div>
  );
}
