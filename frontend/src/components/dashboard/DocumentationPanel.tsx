"use client";

import Link from "next/link";
import { AssetDocumentation } from "@/lib/types";

interface DocumentationPanelProps {
  documentation: AssetDocumentation;
}

export function DocumentationPanel({ documentation }: DocumentationPanelProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-medium text-[#94a3b8] mb-3">Schematics</h3>
        <div className="space-y-2">
          {documentation.schematics.map((schematic, idx) => (
            <a
              key={idx}
              href={schematic.url}
              className="flex items-center justify-between p-3 rounded-lg border border-[#334155] bg-[#1e293b] hover:border-[#3b82f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded flex items-center justify-center bg-[#0f172a] text-[#94a3b8] text-xs font-mono">
                  {schematic.type}
                </span>
                <span className="text-[#f1f5f9] text-sm">{schematic.name}</span>
              </div>
              <span className="text-[#3b82f6] text-sm">View</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[#94a3b8] mb-3">Manuals</h3>
        <div className="space-y-2">
          {documentation.manuals.map((manual, idx) => (
            <a
              key={idx}
              href={manual.url}
              className="flex items-center justify-between p-3 rounded-lg border border-[#334155] bg-[#1e293b] hover:border-[#3b82f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded flex items-center justify-center bg-[#0f172a] text-[#94a3b8] text-xs">
                  PDF
                </span>
                <div>
                  <span className="text-[#f1f5f9] text-sm block">{manual.name}</span>
                  <span className="text-[#94a3b8] text-xs">{manual.pages} pages</span>
                </div>
              </div>
              <span className="text-[#3b82f6] text-sm">Open</span>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-[#94a3b8] mb-3">MTTR Benchmarks</h3>
        <p className="text-xs text-[#94a3b8] mb-3">Estimated repair times based on historical data</p>
        <div className="border border-[#334155] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a]">
                <th className="px-4 py-2 text-left text-[#94a3b8] font-medium">Task</th>
                <th className="px-4 py-2 text-right text-[#94a3b8] font-medium">Est. Hours</th>
              </tr>
            </thead>
            <tbody>
              {documentation.mttrBenchmarks.map((task, idx) => (
                <tr key={idx} className="border-b border-[#334155] last:border-0">
                  <td className="px-4 py-2 text-[#f1f5f9]">{task.task}</td>
                  <td className="px-4 py-2 text-right text-[#94a3b8]">{task.estimatedHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
