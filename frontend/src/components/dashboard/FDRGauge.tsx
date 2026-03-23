"use client";

import { ModelMetrics } from "@/lib/types";

interface FDRGaugeProps {
  metrics: ModelMetrics[];
}

export function FDRGauge({ metrics }: FDRGaugeProps) {
  const latest = metrics[metrics.length - 1];
  const avgFDR = metrics.reduce((sum, m) => sum + m.fdr, 0) / metrics.length;
  
  const targetFDR = 5;
  const fdrPercentage = Math.min((latest.fdr / 20) * 100, 100);
  const targetPercentage = (targetFDR / 20) * 100;
  
  const getColor = (fdr: number) => {
    if (fdr > 10) return "#ef4444";
    if (fdr > targetFDR) return "#eab308";
    return "#22c55e";
  };

  const color = getColor(latest.fdr);
  const isAboveTarget = latest.fdr > targetFDR;

  return (
    <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm text-[#94a3b8] mb-1">False Discovery Rate</h3>
          <p className="text-xs text-[#94a3b8]">Industrial target: &lt; {targetFDR}%</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color }}>
            {latest.fdr.toFixed(1)}%
          </p>
          <p className="text-xs text-[#94a3b8]">Current (30-day avg: {avgFDR.toFixed(1)}%)</p>
        </div>
      </div>

      <div className="relative h-6 bg-[#0f172a] rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full transition-all duration-500"
          style={{
            width: `${fdrPercentage}%`,
            backgroundColor: color,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#f1f5f9]"
          style={{ left: `${targetPercentage}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-[#94a3b8]">
        <span>0%</span>
        <span className="text-[#f1f5f9]">{targetFDR}% (Target)</span>
        <span>20%</span>
      </div>

      {isAboveTarget && (
        <div className="mt-3 p-2 rounded bg-[#eab308]/10 border border-[#eab308]/30">
          <p className="text-xs text-[#eab308]">
            FDR above target threshold. Consider model retuning.
          </p>
        </div>
      )}
    </div>
  );
}
