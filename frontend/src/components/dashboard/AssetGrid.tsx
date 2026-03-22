import { Asset } from "@/lib/types";
import { AssetCard } from "./AssetCard";

interface AssetGridProps {
  assets: Asset[];
}

export function AssetGrid({ assets }: AssetGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center py-12 text-[#94a3b8]">
        No assets found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}
