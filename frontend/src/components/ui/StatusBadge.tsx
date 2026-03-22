import { AssetStatus } from "@/lib/types";

const statusColors: Record<AssetStatus, string> = {
  GREEN: "bg-[#22c55e] text-white",
  YELLOW: "bg-[#eab308] text-black",
  RED: "bg-[#ef4444] text-white",
};

const statusLabels: Record<AssetStatus, string> = {
  GREEN: "Healthy",
  YELLOW: "Warning",
  RED: "Critical",
};

interface StatusBadgeProps {
  status: AssetStatus;
  showLabel?: boolean;
}

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === "GREEN"
            ? "bg-white"
            : status === "YELLOW"
            ? "bg-black"
            : "bg-white"
        }`}
      />
      {showLabel ? statusLabels[status] : status}
    </span>
  );
}
