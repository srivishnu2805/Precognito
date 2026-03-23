"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TemperatureTrendPoint } from "@/lib/types";

interface ThermalTrendChartProps {
  data: TemperatureTrendPoint[];
  assetName: string;
  baselineTemp: number;
  criticalTemp?: number;
}

export function ThermalTrendChart({
  data,
  assetName,
  baselineTemp,
  criticalTemp = 70,
}: ThermalTrendChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 bg-[#0f172a] rounded" />;
  }

  const latestTemp = data[data.length - 1]?.temperature || baselineTemp;
  const isAlert = latestTemp > criticalTemp;

  return (
    <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-medium text-[#f1f5f9]">{assetName}</h4>
          <p className="text-xs text-[#94a3b8]">Temperature Trend (24h)</p>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-bold ${isAlert ? "text-[#ef4444]" : "text-[#22c55e]"}`}
          >
            {latestTemp.toFixed(1)}°C
          </p>
          <p className="text-xs text-[#94a3b8]">Current</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="timestamp"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              interval={3}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              domain={[40, 100]}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#f1f5f9",
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}°C`, "Temperature"]}
            />
            <ReferenceLine
              y={criticalTemp}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: "Critical (70°C)",
                position: "right",
                fill: "#ef4444",
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={baselineTemp}
              stroke="#22c55e"
              strokeDasharray="3 3"
              label={{
                value: "Baseline",
                position: "right",
                fill: "#22c55e",
                fontSize: 10,
              }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke={isAlert ? "#ef4444" : "#3b82f6"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: isAlert ? "#ef4444" : "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
