"use client";

import Link from "next/link";
import { WorkOrder } from "@/lib/types";
import { getSparePartById } from "@/lib/mockData";

interface WorkOrderRowProps {
  workOrder: WorkOrder;
}

const priorityColors: Record<string, string> = {
  LOW: "bg-[#94a3b8]",
  MEDIUM: "bg-[#3b82f6]",
  HIGH: "bg-[#eab308]",
  CRITICAL: "bg-[#ef4444]",
};

const statusColors: Record<string, string> = {
  PENDING: "text-[#eab308] border-[#eab308]",
  IN_PROGRESS: "text-[#3b82f6] border-[#3b82f6]",
  COMPLETED: "text-[#22c55e] border-[#22c55e]",
  CANCELLED: "text-[#94a3b8] border-[#94a3b8]",
};

export function WorkOrderRow({ workOrder }: WorkOrderRowProps) {
  const reservedParts = workOrder.requiredParts.map((rp) => {
    const part = getSparePartById(rp.partId);
    return { ...rp, part };
  });

  const hasConflict = reservedParts.some(
    (rp) => rp.part && rp.part.stockLevel < rp.quantity
  );

  return (
    <div className="border border-[#334155] rounded-lg p-4 bg-[#1e293b]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded text-xs text-white ${priorityColors[workOrder.priority]}`}>
              {workOrder.priority}
            </span>
            <span className="text-sm text-[#94a3b8] font-mono">{workOrder.id}</span>
          </div>
          <h4 className="text-[#f1f5f9] font-medium mb-1">
            <Link href={`/assets/${workOrder.assetId}`} className="hover:text-[#3b82f6]">
              {workOrder.assetName}
            </Link>
          </h4>
          <p className="text-sm text-[#94a3b8]">{workOrder.description}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-2 py-1 rounded border text-xs ${statusColors[workOrder.status]}`}>
            {workOrder.status.replace("_", " ")}
          </span>
          <p className="text-xs text-[#94a3b8] mt-1">{workOrder.estimatedHours}h est.</p>
        </div>
      </div>

      <div className="border-t border-[#334155] pt-3">
        <p className="text-xs text-[#94a3b8] mb-2">Required Parts:</p>
        <div className="flex flex-wrap gap-2">
          {reservedParts.map((rp) => (
            <span
              key={rp.partId}
              className={`px-2 py-1 rounded text-xs ${
                rp.part && rp.part.stockLevel >= rp.quantity
                  ? "bg-[#334155] text-[#f1f5f9]"
                  : "bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]"
              }`}
            >
              {rp.part?.name || rp.partId} x{rp.quantity}
              {rp.part && rp.part.stockLevel < rp.quantity && " (LOW)"}
            </span>
          ))}
        </div>
        {hasConflict && (
          <p className="text-xs text-[#ef4444] mt-2">
            Warning: Insufficient stock for one or more required parts
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#334155]">
        <div className="text-xs text-[#94a3b8]">
          {workOrder.assignedTo && <span>Assigned: {workOrder.assignedTo}</span>}
          {workOrder.scheduledDate && (
            <span className="ml-2">Scheduled: {workOrder.scheduledDate}</span>
          )}
        </div>
        <span className="text-xs text-[#94a3b8]">
          Created: {new Date(workOrder.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
