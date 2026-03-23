"use client";

import { CostAnalysis } from "@/lib/types";

interface DowntimeKPIsProps {
  costAnalysisList: CostAnalysis[];
}

export function DowntimeKPIs({ costAnalysisList }: DowntimeKPIsProps) {
  const totalRiskValue = costAnalysisList.reduce(
    (sum, ca) => sum + ca.riskOfFailurePerHour * ca.potentialDowntimeHours,
    0
  );

  const scheduledTotal = costAnalysisList.reduce(
    (sum, ca) => sum + ca.scheduledRepairCost,
    0
  );

  const emergencyTotal = costAnalysisList.reduce(
    (sum, ca) => sum + ca.emergencyRepairCost,
    0
  );

  const potentialSavings = emergencyTotal - scheduledTotal;

  const immediateActions = costAnalysisList.filter(
    (ca) => ca.recommendation === "IMMEDIATE"
  ).length;

  const scheduledActions = costAnalysisList.filter(
    (ca) => ca.recommendation === "SCHEDULED"
  ).length;

  const monitoringOnly = costAnalysisList.filter(
    (ca) => ca.recommendation === "MONITOR"
  ).length;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-[#f1f5f9]">Executive KPIs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
          <p className="text-sm text-[#94a3b8] mb-1">Total Risk Exposure</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">
            ${(totalRiskValue / 1000).toFixed(0)}K
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">At current failure rate</p>
        </div>

        <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
          <p className="text-sm text-[#94a3b8] mb-1">Potential Savings</p>
          <p className="text-2xl font-bold text-[#22c55e]">
            ${(potentialSavings / 1000).toFixed(1)}K
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">With scheduled repairs</p>
        </div>

        <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
          <p className="text-sm text-[#94a3b8] mb-1">Immediate Actions</p>
          <p className="text-2xl font-bold text-[#ef4444]">{immediateActions}</p>
          <p className="text-xs text-[#94a3b8] mt-1">Require urgent attention</p>
        </div>

        <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
          <p className="text-sm text-[#94a3b8] mb-1">Scheduled / Monitor</p>
          <p className="text-2xl font-bold text-[#f1f5f9]">
            {scheduledActions}/{monitoringOnly}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">Planned & observation</p>
        </div>
      </div>

      <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
        <h3 className="text-sm text-[#94a3b8] mb-3">Cost Breakdown</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#94a3b8]">Emergency Repairs</span>
              <span className="text-[#ef4444]">${emergencyTotal.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ef4444] rounded-full"
                style={{ width: "100%" }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#94a3b8]">Scheduled Repairs</span>
              <span className="text-[#22c55e]">${scheduledTotal.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-[#0f172a] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#22c55e] rounded-full"
                style={{
                  width: `${(scheduledTotal / emergencyTotal) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
