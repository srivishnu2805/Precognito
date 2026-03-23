"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RULTrendPoint } from "@/lib/types";

interface RULTrendChartProps {
  data: RULTrendPoint[];
}

export function RULTrendChart({ data }: RULTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((point) => ({
    date: point.date,
    rul: point.rul,
    confidenceHigh: point.rul + (100 - point.confidence) * 2,
    confidenceLow: point.rul - (100 - point.confidence) * 2,
  }));

  if (!mounted) {
    return <div className="h-64 bg-[#0f172a] rounded" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }}
            label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            formatter={(value, name) => {
              if (name === "rul" && typeof value === "number") return [`${value} hours`, "RUL"];
              return [value, name || ""];
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="transparent"
            fill="#22c55e"
            fillOpacity={0.1}
            name="Confidence Range"
          />
          <Area
            type="monotone"
            dataKey="confidenceLow"
            stroke="transparent"
            fill="#0f172a"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="rul"
            stroke="#22c55e"
            strokeWidth={2}
            fill="#22c55e"
            fillOpacity={0.2}
            name="RUL"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}