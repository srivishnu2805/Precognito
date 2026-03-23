"use client";

import { ModelMetrics } from "@/lib/types";

interface ModelAccuracyCardProps {
  metrics: ModelMetrics[];
}

export function ModelAccuracyCard({ metrics }: ModelAccuracyCardProps) {
  const latest = metrics[metrics.length - 1];
  
  const total = latest.truePositives + latest.falsePositives + latest.trueNegatives + latest.falseNegatives;
  const accuracy = ((latest.truePositives + latest.trueNegatives) / total) * 100;

  const detectionRate = latest.truePositives + latest.falseNegatives > 0
    ? (latest.truePositives / (latest.truePositives + latest.falseNegatives)) * 100
    : 0;

  const stats = [
    { label: "True Positives", value: latest.truePositives, color: "#22c55e", desc: "Correctly detected anomalies" },
    { label: "False Positives", value: latest.falsePositives, color: "#ef4444", desc: "False alarms" },
    { label: "True Negatives", value: latest.trueNegatives, color: "#94a3b8", desc: "Correctly identified normal" },
    { label: "False Negatives", value: latest.falseNegatives, color: "#eab308", desc: "Missed anomalies" },
  ];

  return (
    <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
      <h3 className="text-sm text-[#94a3b8] mb-4">Detection Metrics (Latest)</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-3 rounded-lg bg-[#0f172a]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
              <span className="text-xs text-[#94a3b8]">{stat.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#334155]">
        <div>
          <p className="text-xs text-[#94a3b8]">Precision</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{latest.precision.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">Recall</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{detectionRate.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-[#94a3b8]">F1 Score</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{latest.f1Score.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}
