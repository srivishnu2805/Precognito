"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HealthTrend } from "@/lib/types";

interface ReportChartProps {
  data: HealthTrend[];
}

export function ReportChart({ data }: ReportChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 bg-[#0f172a] rounded" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="healthy"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            name="Healthy"
          />
          <Line
            type="monotone"
            dataKey="warning"
            stroke="#eab308"
            strokeWidth={2}
            dot={false}
            name="Warning"
          />
          <Line
            type="monotone"
            dataKey="critical"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            name="Critical"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}