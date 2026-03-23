import { mockCostAnalysis } from "@/lib/mockData";
import { RiskGauge } from "@/components/dashboard/RiskGauge";
import { CostComparisonCard } from "@/components/dashboard/CostComparisonCard";
import { DowntimeKPIs } from "@/components/dashboard/DowntimeKPIs";

export default function ExecutivePage() {
  const costAnalysis = mockCostAnalysis;

  const sortedByRisk = [...costAnalysis].sort((a, b) => b.riskScore - a.riskScore);
  const criticalAssets = costAnalysis.filter((ca) => ca.recommendation === "IMMEDIATE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Executive Decision Support</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Assets Analyzed: <span className="text-[#f1f5f9]">{costAnalysis.length}</span>
          </span>
          {criticalAssets.length > 0 && (
            <span className="px-2 py-1 rounded bg-[#ef4444]/20 text-[#ef4444] text-xs">
              {criticalAssets.length} Critical
            </span>
          )}
        </div>
      </div>

      <DowntimeKPIs costAnalysisList={costAnalysis} />

      <section>
        <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Risk Assessment by Asset</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedByRisk.map((ca) => (
            <RiskGauge key={ca.assetId} costAnalysis={ca} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Cost-Benefit Analysis</h2>
        <p className="text-sm text-[#94a3b8] mb-4">
          Compare emergency repair costs vs scheduled maintenance to optimize maintenance budget
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sortedByRisk.map((ca) => (
            <CostComparisonCard key={ca.assetId} costAnalysis={ca} />
          ))}
        </div>
      </section>

      {criticalAssets.length > 0 && (
        <section className="border border-[#ef4444] rounded-lg p-4 bg-[#ef4444]/5">
          <h2 className="text-lg font-medium text-[#ef4444] mb-2">Urgent Recommendations</h2>
          <ul className="space-y-2">
            {criticalAssets.map((ca) => (
              <li key={ca.assetId} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-[#f1f5f9]">
                  <strong>{ca.assetName}</strong>: Risk of failure at ${ca.riskOfFailurePerHour.toLocaleString()}/hr.
                  Schedule repair now to save ${(ca.emergencyRepairCost - ca.scheduledRepairCost).toLocaleString()}.
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
