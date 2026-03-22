import Link from "next/link";
import { Asset } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link
      href={`/assets/${asset.id}`}
      className="block p-4 border border-[#334155] rounded-lg bg-[#1e293b] hover:bg-[#334155] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-[#f1f5f9]">{asset.name}</h3>
          <p className="text-sm text-[#94a3b8]">{asset.type}</p>
        </div>
        <StatusBadge status={asset.status} />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#94a3b8]">Location</span>
          <span className="text-[#f1f5f9]">{asset.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#94a3b8]">RMS</span>
          <span className="text-[#f1f5f9]">{asset.rms.toFixed(2)} mm/s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#94a3b8]">RUL</span>
          <span className="text-[#f1f5f9]">{asset.rul} hrs</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#94a3b8]">
        Updated {new Date(asset.lastUpdated).toLocaleString()}
      </p>
    </Link>
  );
}
