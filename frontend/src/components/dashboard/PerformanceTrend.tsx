"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ModelMetrics } from "@/lib/types";

interface PerformanceTrendProps {
  metrics: ModelMetrics[];
}

export function PerformanceTrend({ metrics }: PerformanceTrendProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = metrics.map((m) => ({
    date: m.date,
    precision: m.precision,
    recall: m.recall,
    f1Score: m.f1Score,
    fdr: m.fdr,
  }));

  if (!mounted) {
    return (
      <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
        <h3 className="text-sm text-[#94a3b8] mb-4">Performance Over Time (30 Days)</h3>
        <div className="h-[300px] bg-[#0f172a] rounded" />
      </div>
    );
  }

  return (
    <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b]">
      <h3 className="text-sm text-[#94a3b8] mb-4">Performance Over Time (30 Days)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              interval={4}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, ""]}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => (
                <span className="text-[#94a3b8] text-sm">{value}</span>
              )}
            />
            <Line
              type="monotone"
              dataKey="precision"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Precision"
            />
            <Line
              type="monotone"
              dataKey="recall"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Recall"
            />
            <Line
              type="monotone"
              dataKey="f1Score"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="F1 Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
