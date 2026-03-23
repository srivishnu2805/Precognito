"use client";

import { CostAnalysis } from "@/lib/types";
import Link from "next/link";

interface CostComparisonCardProps {
  costAnalysis: CostAnalysis;
}

export function CostComparisonCard({ costAnalysis }: CostComparisonCardProps) {
  const savings = costAnalysis.emergencyRepairCost - costAnalysis.scheduledRepairCost;
  const savingsPercent = ((savings / costAnalysis.emergencyRepairCost) * 100).toFixed(0);

  return (
    <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
      <h3 className="text-sm text-[#94a3b8] mb-1">Cost Comparison</h3>
      <p className="text-lg font-medium text-[#f1f5f9] mb-4">
        <Link href={`/assets/${costAnalysis.assetId}`} className="hover:text-[#3b82f6]">
          {costAnalysis.assetName}
        </Link>
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg bg-[#0f172a] border border-[#ef4444]/30">
          <p className="text-xs text-[#94a3b8] mb-1">Emergency Repair</p>
          <p className="text-xl font-bold text-[#ef4444]">
            ${costAnalysis.emergencyRepairCost.toLocaleString()}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">
            {costAnalysis.potentialDowntimeHours}h downtime
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0f172a] border border-[#22c55e]/30">
          <p className="text-xs text-[#94a3b8] mb-1">Scheduled Repair</p>
          <p className="text-xl font-bold text-[#22c55e]">
            ${costAnalysis.scheduledRepairCost.toLocaleString()}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">Planned maintenance</p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#94a3b8]">Potential Savings</span>
          <div className="text-right">
            <p className="text-lg font-bold text-[#22c55e]">
              ${savings.toLocaleString()}
            </p>
            <p className="text-xs text-[#94a3b8]">{savingsPercent}% reduction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
