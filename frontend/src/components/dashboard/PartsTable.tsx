"use client";

import { SparePart } from "@/lib/types";

interface PartsTableProps {
  parts: SparePart[];
  onSort?: (field: keyof SparePart) => void;
  sortField?: keyof SparePart;
  sortDirection?: "asc" | "desc";
}

const statusColors: Record<string, string> = {
  IN_STOCK: "bg-[#22c55e]",
  LOW_STOCK: "bg-[#eab308]",
  OUT_OF_STOCK: "bg-[#ef4444]",
  ORDERED: "bg-[#3b82f6]",
};

export function PartsTable({ parts, sortField, sortDirection }: PartsTableProps) {
  return (
    <div className="border border-[#334155] rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#334155] bg-[#1e293b]">
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Part Number</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Name</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Category</th>
            <th className="px-4 py-3 text-right text-[#94a3b8] font-medium">Stock</th>
            <th className="px-4 py-3 text-right text-[#94a3b8] font-medium">Reorder</th>
            <th className="px-4 py-3 text-right text-[#94a3b8] font-medium">Lead Time</th>
            <th className="px-4 py-3 text-right text-[#94a3b8] font-medium">Unit Cost</th>
            <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Supplier</th>
            <th className="px-4 py-3 text-center text-[#94a3b8] font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.id} className="border-b border-[#334155] hover:bg-[#1e293b] transition-colors">
              <td className="px-4 py-3 text-[#f1f5f9] font-mono text-xs">{part.partNumber}</td>
              <td className="px-4 py-3 text-[#f1f5f9]">{part.name}</td>
              <td className="px-4 py-3 text-[#94a3b8]">{part.category}</td>
              <td className="px-4 py-3 text-right text-[#f1f5f9]">{part.stockLevel}</td>
              <td className="px-4 py-3 text-right text-[#94a3b8]">{part.reorderPoint}</td>
              <td className="px-4 py-3 text-right text-[#94a3b8]">{part.leadTimeDays} days</td>
              <td className="px-4 py-3 text-right text-[#f1f5f9]">${part.unitCost.toLocaleString()}</td>
              <td className="px-4 py-3 text-[#94a3b8]">{part.supplier}</td>
              <td className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs text-white ${statusColors[part.status]}`}
                >
                  {part.status.replace("_", " ")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
