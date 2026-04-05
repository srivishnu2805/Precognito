"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Asset, SensorDataPoint, RULTrendPoint, FaultPrediction } from "@/lib/types";
import { AssetDetailHeader } from "@/components/dashboard/AssetDetailHeader";
import { FFTChart } from "@/components/dashboard/FFTChart";
import { RULTrendChart } from "@/components/dashboard/RULTrendChart";
import { FaultBadge } from "@/components/dashboard/FaultBadge";
import { QRTag } from "@/components/dashboard/QRTag";

interface AssetDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * @fileoverview Asset Detail Page providing deep-dive analytics for a single machine.
 * Includes live vibration trends, RUL forecasting, and printable QR identification tags.
 * 
 * @param {AssetDetailPageProps} props Component props.
 * @returns {JSX.Element} The rendered asset detail page.
 */
export default function AssetDetailPage({ params }: AssetDetailPageProps) {
  const { id } = use(params);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Loads telemetry and predictive data for the specific asset.
     */
    async function loadData() {
      try {
        const [assetsData, telData, predData] = await Promise.all([
          api.getAssets(),
          api.getAssetTelemetry(id),
          api.getAssetPredictions(id)
        ]);

        const currentAsset = assetsData.find((a: Asset) => a.id === id);
        if (!currentAsset) {
          setError("Asset not found");
          return;
        }

        const latestPrediction = predData.length > 0 ? predData[predData.length - 1] : null;
        const latestRUL = latestPrediction ? latestPrediction.predicted_rul_hours : currentAsset.rul;
        
        const updatedAsset = { 
          ...currentAsset, 
          rul: latestRUL || 0,
        };
        
        if (latestPrediction) {
          updatedAsset.status = latestPrediction.risk_level === "High-Risk" ? "RED" : latestPrediction.risk_level === "Warning" ? "YELLOW" : "GREEN";
        }

        setAsset(updatedAsset);
        setTelemetry(telData);
        setPredictions(predData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load asset data";
        console.error("Failed to load asset data", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-[#94a3b8]">Loading asset details...</div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-bold text-[#f1f5f9] mb-2">Error</h1>
        <p className="text-[#94a3b8]">{error || "Asset not found"}</p>
      </div>
    );
  }

  // Transform data for charts
  const fftData: SensorDataPoint[] = telemetry.map((t, idx) => ({
    frequency: idx, 
    amplitude: t.vibration || 0
  })).slice(-50); 

  const rulTrend: RULTrendPoint[] = predictions.map(p => ({
    date: new Date(p._time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    rul: p.predicted_rul_hours || 0,
    confidence: p.confidence_score_percent || 0
  })).slice(-20); 

  const latestPred = predictions[predictions.length - 1];
  const faultPrediction: FaultPrediction | null = latestPred ? {
    type: latestPred.predicted_fault_type || "Normal",
    confidence: latestPred.confidence_score_percent || 0,
    timestamp: latestPred._time,
    recommendation: latestPred.risk_level === "High-Risk" ? "Immediate Maintenance Required" : "Schedule Maintenance"
  } : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 w-full">
          <AssetDetailHeader asset={asset} />
        </div>
        <div className="flex-shrink-0 bg-[#1e293b] p-4 rounded-lg border border-[#334155] w-full xl:w-auto flex flex-col items-center">
          <h3 className="text-xs font-medium text-[#94a3b8] mb-3 uppercase tracking-wider text-center w-full">Physical Asset Tag</h3>
          <QRTag assetId={asset.id} assetName={asset.name} />
        </div>
      </div>

      {faultPrediction && (
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
          <h2 className="text-sm font-medium text-[#f1f5f9] mb-3">AI Fault Prediction</h2>
          <FaultBadge prediction={faultPrediction} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
          <h2 className="text-sm font-medium text-[#f1f5f9] mb-4">Vibration Trend (Live)</h2>
          <FFTChart data={fftData} />
        </div>

        <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
          <h2 className="text-sm font-medium text-[#f1f5f9] mb-4">RUL Trend (Live)</h2>
          <RULTrendChart data={rulTrend} />
        </div>
      </div>
    </div>
  );
}
