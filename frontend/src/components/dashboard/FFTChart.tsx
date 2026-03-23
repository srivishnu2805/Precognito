"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { FFTBin } from "@/lib/types";

interface FFTChartProps {
  data: FFTBin[];
}

export function FFTChart({ data }: FFTChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data.map((bin) => ({
    frequency: bin.frequency,
    amplitude: bin.amplitude,
    baseline: bin.baselineAmplitude,
  }));

  if (!mounted) {
    return <div className="h-64 bg-[#0f172a] rounded" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="frequency" 
            stroke="#94a3b8" 
            tick={{ fontSize: 10 }} 
            tickFormatter={(v) => `${Math.round(v)}`}
            interval={7}
          />
          <YAxis 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }}
            label={{ value: "mm/s", angle: -90, position: "insideLeft", fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
            }}
            labelFormatter={(v) => `Frequency: ${v} Hz`}
          />
          <Legend />
          <Bar dataKey="baseline" name="Baseline" fill="#334155" fillOpacity={0.5} />
          <Bar dataKey="amplitude" name="Current" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}