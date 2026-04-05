/**
 * @file FaultBadge component for displaying a specific fault prediction and confidence level.
 */

"use client";

import { FaultPrediction } from "@/lib/types";

interface FaultBadgeProps {
  prediction: FaultPrediction;
}

/**
 * Renders a badge indicating the type of predicted fault and the model's confidence.
 * 
 * @param {FaultBadgeProps} props The component props.
 * @param {FaultPrediction} props.prediction The fault prediction data.
 * @returns {JSX.Element} The rendered fault badge.
 */
export function FaultBadge({ prediction }: FaultBadgeProps) {
  const isNormal = prediction.type === "Normal Operation";
  const statusColor = isNormal 
    ? "bg-[#22c55e]/20 text-[#22c55e]" 
    : "bg-[#ef4444]/20 text-[#ef4444]";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColor}`}>
          {prediction.type}
        </span>
        <span className="text-sm text-[#94a3b8]">
          {(prediction.confidence).toFixed(1)}% confidence
        </span>
      </div>
      <p className="text-sm text-[#94a3b8]">{prediction.recommendation}</p>
    </div>
  );
}
