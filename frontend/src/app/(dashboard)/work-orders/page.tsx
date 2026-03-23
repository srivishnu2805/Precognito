"use client";

import { useState } from "react";
import { mockAssetDocumentation, mockAuditTrail, mockWorkOrders } from "@/lib/mockData";
import { DocumentationPanel } from "@/components/dashboard/DocumentationPanel";
import { QRScanner } from "@/components/dashboard/QRScanner";
import { AuditTrailTable } from "@/components/dashboard/AuditTrailTable";
import Link from "next/link";

type TabType = "docs" | "audit" | "checkin";

export default function WorkOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("docs");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  const currentDoc = selectedAsset
    ? mockAssetDocumentation.find((d) => d.assetId === selectedAsset)
    : mockAssetDocumentation[0];

  const handleScan = (data: string) => {
    setShowScanner(false);
    const assetId = data.toUpperCase();
    if (assetId.startsWith("ASSET-") || mockAssetDocumentation.some((d) => d.assetId === assetId)) {
      setSelectedAsset(assetId);
      setCheckInStatus(`Validated: ${assetId}`);
      setTimeout(() => setCheckInStatus(null), 3000);
    } else {
      setCheckInStatus(`Unknown asset: ${data}`);
    }
  };

  const tabs = [
    { id: "docs" as TabType, label: "Documentation" },
    { id: "audit" as TabType, label: "Audit Trail" },
    { id: "checkin" as TabType, label: "QR Check-In" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Work Order Management</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Active Orders:{" "}
            <span className="text-[#f1f5f9]">
              {mockWorkOrders.filter((wo) => wo.status !== "COMPLETED").length}
            </span>
          </span>
        </div>
      </div>

      <div className="flex border-b border-[#334155]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-[#3b82f6] border-b-2 border-[#3b82f6]"
                : "text-[#94a3b8] hover:text-[#f1f5f9]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "docs" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-[#94a3b8] mb-3">Select Asset</h3>
            <div className="space-y-2">
              {mockAssetDocumentation.map((doc) => (
                <button
                  key={doc.assetId}
                  onClick={() => setSelectedAsset(doc.assetId)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    (selectedAsset === doc.assetId || (!selectedAsset && doc === currentDoc))
                      ? "border-[#3b82f6] bg-[#3b82f6]/10"
                      : "border-[#334155] bg-[#1e293b] hover:border-[#475569]"
                  }`}
                >
                  <p className="text-sm text-[#f1f5f9] font-medium">{doc.assetName}</p>
                  <p className="text-xs text-[#94a3b8] font-mono">{doc.assetId}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            {currentDoc && <DocumentationPanel documentation={currentDoc} />}
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-[#f1f5f9]">Compliance Audit Trail</h2>
            <p className="text-sm text-[#94a3b8]">
              Geo-timestamped check-in/check-out logs for ISO compliance
            </p>
          </div>
          <AuditTrailTable entries={mockAuditTrail} />
        </div>
      )}

      {activeTab === "checkin" && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-4">Field Check-In</h2>
          <p className="text-sm text-[#94a3b8] mb-4">
            Scan the QR code at the asset location to validate your presence for the compliance audit trail.
          </p>

          {checkInStatus && (
            <div
              className={`p-4 rounded-lg mb-4 ${
                checkInStatus.includes("Validated")
                  ? "bg-[#22c55e]/20 border border-[#22c55e]/30 text-[#22c55e]"
                  : "bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444]"
              }`}
            >
              {checkInStatus}
            </div>
          )}

          <div className="border border-[#334155] rounded-lg p-6 bg-[#1e293b] text-center">
            {showScanner ? (
              <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            ) : (
              <>
                <div className="w-32 h-32 mx-auto mb-4 bg-[#0f172a] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-16 h-16 text-[#3b82f6]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
                >
                  Open QR Scanner
                </button>
                <p className="text-xs text-[#94a3b8] mt-4">
                  Works on mobile devices with camera access
                </p>
              </>
            )}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-[#0f172a] border border-[#334155]">
            <h4 className="text-sm font-medium text-[#f1f5f9] mb-2">Quick Access</h4>
            <div className="grid grid-cols-2 gap-2">
              {mockAssetDocumentation.map((doc) => (
                <button
                  key={doc.assetId}
                  onClick={() => handleScan(doc.assetId)}
                  className="p-2 text-left text-sm bg-[#1e293b] rounded border border-[#334155] hover:border-[#3b82f6] transition-colors"
                >
                  <span className="text-[#f1f5f9]">{doc.assetName}</span>
                  <br />
                  <span className="text-xs text-[#94a3b8] font-mono">{doc.assetId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
