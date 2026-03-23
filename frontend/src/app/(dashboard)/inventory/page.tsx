import { mockSpareParts, mockWorkOrders, getJITAlerts } from "@/lib/mockData";
import { PartsTable } from "@/components/dashboard/PartsTable";
import { StockAlertCard } from "@/components/dashboard/StockAlertCard";
import { WorkOrderRow } from "@/components/dashboard/WorkOrderRow";

export default function InventoryPage() {
  const spareParts = mockSpareParts;
  const workOrders = mockWorkOrders;
  const jitAlerts = getJITAlerts();

  const lowStockParts = spareParts.filter((p) => p.status === "LOW_STOCK" || p.status === "OUT_OF_STOCK");
  const activeWorkOrders = workOrders.filter((wo) => wo.status !== "COMPLETED" && wo.status !== "CANCELLED");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#f1f5f9]">Inventory Management</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#94a3b8]">
            Total Parts: <span className="text-[#f1f5f9]">{spareParts.length}</span>
          </span>
          <span className="text-[#94a3b8]">
            Active Orders: <span className="text-[#f1f5f9]">{activeWorkOrders.length}</span>
          </span>
          {jitAlerts.length > 0 && (
            <span className="px-2 py-1 rounded bg-[#ef4444]/20 text-[#ef4444] text-xs">
              {jitAlerts.length} JIT Alert{jitAlerts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {jitAlerts.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Just-in-Time Logistics Alerts</h2>
          <p className="text-sm text-[#94a3b8] mb-3">
            Parts needed before RUL falls below (Lead Time × 1.1)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jitAlerts.map((part) => (
              <StockAlertCard key={part.id} part={part} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Spare Parts Inventory</h2>
        <PartsTable parts={spareParts} />
      </section>

      {lowStockParts.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Low Stock & Critical Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lowStockParts.map((part) => (
              <div
                key={part.id}
                className={`border rounded-lg p-4 ${
                  part.status === "OUT_OF_STOCK" ? "border-[#ef4444]" : "border-[#eab308]"
                } bg-[#1e293b]`}
              >
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs text-white mb-2 ${
                    part.status === "OUT_OF_STOCK" ? "bg-[#ef4444]" : "bg-[#eab308]"
                  }`}
                >
                  {part.status.replace("_", " ")}
                </span>
                <h4 className="text-[#f1f5f9] font-medium text-sm">{part.name}</h4>
                <p className="text-xs text-[#94a3b8] font-mono mt-1">{part.partNumber}</p>
                <p className="text-lg font-semibold mt-2 text-[#f1f5f9]">
                  {part.stockLevel}
                  <span className="text-sm text-[#94a3b8] font-normal"> / {part.reorderPoint}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-medium text-[#f1f5f9] mb-3">Work Orders</h2>
        <div className="space-y-4">
          {activeWorkOrders.map((wo) => (
            <WorkOrderRow key={wo.id} workOrder={wo} />
          ))}
        </div>
      </section>
    </div>
  );
}
