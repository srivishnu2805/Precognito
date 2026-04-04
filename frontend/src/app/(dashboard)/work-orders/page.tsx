/**
 * @fileoverview Work Order management page for maintenance tracking and compliance.
 * This module handles digital documentation access, compliance audit trails, 
 * and QR-code-based field check-ins for maintenance technicians.
 */

"use client";

import { useEffect, useState } from "react";
import { mockAssetDocumentation } from "@/lib/mockData";
import { DocumentationPanel } from "@/components/dashboard/DocumentationPanel";
import { QRScanner } from "@/components/dashboard/QRScanner";
import { AuditTrailTable } from "@/components/dashboard/AuditTrailTable";
import { api } from "@/lib/api";
import Link from "next/link";

type TabType = "docs" | "audit" | "checkin";

/**
 * WorkOrdersPage component for maintenance execution and compliance tracking.
 * 
 * @returns {JSX.Element} The rendered work orders page.
 */
export default function WorkOrdersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("docs");
  const [showScanner, setShowScanner] = useState(false);
  const [manualId, setManualId] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Completion Modal State
  const [completingTask, setCompletingTask] = useState<any | null>(null);
  const [resolution, setResolution] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [partQty, setPartQty] = useState(1);
  const [laborHours, setLaborHours] = useState(1);

  const loadData = async () => {
    try {
      const [woData, invData] = await Promise.all([
        api.getWorkOrders(),
        api.getInventory()
      ]);

      setWorkOrders(woData || []);
      setInventory(invData || []);
    } catch (err) {
      console.error("Failed to load work order data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const currentDoc = selectedAsset
    ? mockAssetDocumentation.find((d) => d.assetId === selectedAsset)
    : mockAssetDocumentation[0];

  const handleScan = async (data: string) => {
    setShowScanner(false);
    const assetId = data.toUpperCase();
    
    try {
      await api.createAudit({
        assetId: assetId,
        status: "CHECK_IN",
        remarks: "Check-in Verified"
      });
      
      setSelectedAsset(assetId);
      setCheckInStatus(`Validated: ${assetId}`);
      loadData();
    } catch (err) {
      setCheckInStatus(`Check-in failed: ${assetId}`);
    }
    
    setTimeout(() => setCheckInStatus(null), 3000);
  };

  const handleCompleteTask = async () => {
    if (!completingTask) return;
    
    try {
      await api.completeWorkOrder(completingTask.id, {
        resolution,
        partId: selectedPart ? parseInt(selectedPart) : undefined,
        quantityUsed: partQty,
        laborHours: laborHours
      });
      
      setCompletingTask(null);
      setResolution("");
      setSelectedPart("");
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      alert(`Error: ${message}`);
    }
  };

  const tabs = [
    { id: "docs" as TabType, label: "Documentation" },
    { id: "audit" as TabType, label: "Audit Trail" },
    { id: "checkin" as TabType, label: "QR Check-In" },
  ];

  const activeWorkOrders = workOrders.filter((wo) => wo.status !== "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Work Order Management</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Active Orders:{" "}
            <span className="text-[#f1f5f9]">
              {activeWorkOrders.length}
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
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium text-[#f1f5f9] mb-4">Tasks Assigned to You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeWorkOrders.length === 0 ? (
                <div className="col-span-2 p-8 text-center border border-dashed border-[#334155] rounded-lg text-[#64748b]">
                  No pending tasks assigned.
                </div>
              ) : (
                activeWorkOrders.map((wo) => (
                  <div key={wo.id} className="p-4 border border-[#334155] rounded-lg bg-[#1e293b] flex justify-between items-center">
                    <div>
                      <h4 className="text-[#f1f5f9] font-medium">{wo.assetName}</h4>
                      <p className="text-xs text-[#94a3b8] mt-1 line-clamp-1">{wo.remarks}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-[#3b82f6]/20 text-[#3b82f6] px-1.5 py-0.5 rounded font-bold">{wo.status}</span>
                        <span className="text-[10px] text-[#64748b]">{new Date(wo.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCompletingTask(wo)}
                      className="px-3 py-1.5 bg-[#22c55e] text-white text-xs font-bold rounded hover:bg-[#16a34a] transition-colors"
                    >
                      COMPLETE
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#f1f5f9]">Compliance Audit Trail</h2>
              <p className="text-sm text-[#94a3b8]">Full maintenance history</p>
            </div>
            <AuditTrailTable entries={workOrders.map(wo => ({
              id: wo.id.toString(),
              assetId: wo.assetId,
              assetName: wo.assetName,
              technicianName: wo.assignedTo || "System",
              action: wo.status,
              timestamp: wo.timestamp,
              location: { lat: 0, lng: 0 },
              qrValidated: wo.remarks?.includes("Verified") || wo.status === "COMPLETED",
              mttr: wo.mttr
            }))} />
          </section>
        </div>
      )}

      {activeTab === "checkin" && (
        <div className="max-w-2xl">
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-4">Field Check-In</h2>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="Enter Asset ID manually..."
              className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
            />
            <button
              onClick={() => handleScan(manualId)}
              className="px-4 py-2 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
            >
              Check In
            </button>
          </div>

          <div className="relative border border-[#334155] rounded-lg p-6 bg-[#1e293b] text-center">
            <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 text-[10px] text-white rounded">
              ISO 55001 COMPLIANT
            </div>
            
            {showScanner ? (
              <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            ) : (
              <>
                <div className="w-24 h-24 mx-auto mb-4 bg-[#0f172a] rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors font-medium"
                >
                  Start QR Scanner
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Completion Modal */}
      {completingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#1e293b] rounded-lg overflow-hidden border border-[#334155]">
            <div className="p-4 border-b border-[#334155]">
              <h3 className="text-lg font-medium text-[#f1f5f9]">Finalize Work Order</h3>
              <p className="text-xs text-[#94a3b8]">{completingTask.assetName} ({completingTask.assetId})</p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Resolution Notes</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="What was fixed?"
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] text-sm focus:outline-none focus:border-[#3b82f6] min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#94a3b8] mb-1">Spare Part Used</label>
                  <select
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] text-sm focus:outline-none focus:border-[#3b82f6]"
                  >
                    <option value="">None</option>
                    {inventory.map(p => (
                      <option key={p.id} value={p.id}>{p.partName} ({p.quantity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#94a3b8] mb-1">Qty Used</label>
                  <input
                    type="number"
                    value={partQty}
                    onChange={(e) => setPartQty(parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] text-sm focus:outline-none focus:border-[#3b82f6]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#94a3b8] mb-1">Actual Labor Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] text-sm focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#334155] flex justify-end gap-2">
              <button
                onClick={() => setCompletingTask(null)}
                className="px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9]"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteTask}
                className="px-4 py-2 bg-[#22c55e] text-white text-sm font-medium rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Finalize & Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
