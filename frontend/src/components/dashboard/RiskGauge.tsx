"use client";

import { CostAnalysis } from "@/lib/types";
import Link from "next/link";

interface RiskGaugeProps {
  costAnalysis: CostAnalysis;
}

export function RiskGauge({ costAnalysis }: RiskGaugeProps) {
  const maxRisk = 100;
  const percentage = Math.min((costAnalysis.riskScore / maxRisk) * 100, 100);
  
  const getColor = (score: number) => {
    if (score >= 70) return "#ef4444";
    if (score >= 40) return "#eab308";
    return "#22c55e";
  };

  const color = getColor(costAnalysis.riskScore);

  return (
    <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm text-[#94a3b8] mb-1">Risk of Failure</h3>
          <p className="text-lg font-medium text-[#f1f5f9]">
            <Link href={`/assets/${costAnalysis.assetId}`} className="hover:text-[#3b82f6]">
              {costAnalysis.assetName}
            </Link>
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>
            {costAnalysis.riskScore}%
          </p>
          <p className="text-sm text-[#94a3b8]">
            ${costAnalysis.riskOfFailurePerHour.toLocaleString()}/hr
          </p>
        </div>
      </div>

      <div className="relative h-3 bg-[#0f172a] rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-[#94a3b8]">
        <span>Low Risk</span>
        <span>High Risk</span>
      </div>
    </div>
  );
}
