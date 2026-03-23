import { mockModelMetrics } from "@/lib/mockData";
import { FDRGauge } from "@/components/dashboard/FDRGauge";
import { ModelAccuracyCard } from "@/components/dashboard/ModelAccuracyCard";
import { PerformanceTrend } from "@/components/dashboard/PerformanceTrend";

export default function AnalyticsPage() {
  const metrics = mockModelMetrics;
  const latest = metrics[metrics.length - 1];
  
  const totalPredictions = metrics.reduce(
    (sum, m) => sum + m.truePositives + m.falsePositives + m.trueNegatives + m.falseNegatives,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Model Performance Analytics</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Analysis Period: <span className="text-[#f1f5f9]">30 days</span>
          </span>
          <span className="px-2 py-1 rounded bg-[#3b82f6]/20 text-[#3b82f6] text-xs">
            {totalPredictions.toLocaleString()} Total Predictions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ModelAccuracyCard metrics={metrics} />
        </div>
        <div className="lg:col-span-2">
          <FDRGauge metrics={metrics} />
        </div>
      </div>

      <PerformanceTrend metrics={metrics} />

      <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
        <h3 className="text-sm text-[#94a3b8] mb-4">Model Validation Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Model Accuracy</p>
            <p className="text-2xl font-bold text-[#22c55e]">
              {(((latest.truePositives + latest.trueNegatives) /
                (latest.truePositives + latest.trueNegatives + latest.falsePositives + latest.falseNegatives)) *
                100).toFixed(1)}%
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">Within acceptable range</p>
          </div>
          
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">False Discovery Rate</p>
            <p className="text-2xl font-bold text-[#f1f5f9]">
              {latest.fdr.toFixed(1)}%
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">
              {latest.fdr <= 5 ? "Meets target (&lt;5%)" : "Above target"}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">Anomalies Detected</p>
            <p className="text-2xl font-bold text-[#3b82f6]">
              {metrics.reduce((sum, m) => sum + m.truePositives, 0)}
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">Over 30 days</p>
          </div>
          
          <div className="p-4 rounded-lg bg-[#0f172a]">
            <p className="text-xs text-[#94a3b8] mb-1">False Alarms</p>
            <p className="text-2xl font-bold text-[#eab308]">
              {metrics.reduce((sum, m) => sum + m.falsePositives, 0)}
            </p>
            <p className="text-xs text-[#94a3b8] mt-1">Operator noise</p>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30">
        <h4 className="text-sm font-medium text-[#22c55e] mb-2">Validation Status</h4>
        <p className="text-sm text-[#94a3b8]">
          The anomaly detection engine is performing within industrial reliability standards.
          FDR of {latest.fdr.toFixed(1)}% is {latest.fdr <= 5 ? "within" : "slightly above"} the target threshold of 5%.
          {latest.fdr <= 5
            ? " Model is validated for production use."
            : " Consider periodic model retraining to reduce false alarms."}
        </p>
      </div>
    </div>
  );
}
