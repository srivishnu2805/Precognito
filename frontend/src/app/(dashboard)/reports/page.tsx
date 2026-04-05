/**
 * @fileoverview Reports page for generating and downloading asset health reports.
 * This module provides the user interface for configuring and viewing reports
 * based on asset telemetry and maintenance data.
 */

"use client";

import { useState } from "react";
import { Report, ReportType, ReportCategory } from "@/lib/types";
import { mockReports, mockHealthTrend } from "@/lib/mockData";
import { ReportConfigForm } from "@/components/dashboard/ReportConfigForm";
import { ReportList } from "@/components/dashboard/ReportList";
import { ReportChart } from "@/components/dashboard/ReportChart";
import { api } from "@/lib/api";
import { downloadCSV, downloadPDF } from "@/lib/reporting";

/**
 * ReportsPage component for managing and generating system reports.
 * 
 * @returns {JSX.Element} The rendered reports page.
 */
export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [showChart, setShowChart] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * Handles the generation of a new report based on user configuration.
   * 
   * @param {Object} config The report configuration.
   * @param {ReportType} config.type The format of the report (e.g., CSV, PDF).
   * @param {ReportCategory} config.category The category of data to include.
   * @param {string[]} config.assets The list of asset IDs to include.
   * @param {Object} config.dateRange The date range for the report.
   * @param {string} config.dateRange.from The start date.
   * @param {string} config.dateRange.to The end date.
   * @returns {Promise<void>}
   */
  const handleGenerate = async (config: {
    type: ReportType;
    category: ReportCategory;
    assets: string[];
    dateRange: { from: string; to: string };
  }) => {
    setIsGenerating(true);
    
    // Simulate generation delay
    setTimeout(() => {
      const newReport: Report = {
        id: `REP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        name: `${config.category.charAt(0) + config.category.slice(1).toLowerCase()} Report`,
        type: config.type,
        category: config.category,
        assets: config.assets,
        dateRange: config.dateRange,
        createdAt: new Date().toISOString(),
        status: "READY",
      };
      
      setReports([newReport, ...reports]);
      setShowChart(true);
      setIsGenerating(false);
    }, 1500);
  };

  /**
   * Handles downloading a specific report.
   * 
   * @param {Report} report The report object to download.
   * @returns {Promise<void>}
   */
  const handleDownload = async (report: Report) => {
    let data: Record<string, unknown>[] = [];
    
    try {
      // Fetch relevant data based on category
      if (report.category === "COMPLIANCE") {
        // Use admin-reporting endpoint for compliance
        data = await api.getAuditCompliance();
      } else if (report.category === "HEALTH") {
        data = await api.getAssets();
      } else if (report.category === "ROI") {
        const metrics = await api.getModelMetrics();
        const oee = await api.getOEEMetrics();
        data = [{ ...metrics, ...oee }];
      }

      if (data.length === 0) {
        alert("No data available for this report. Please try a different category or date range.");
        return;
      }

      const fileName = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().getTime()}`;

      if (report.type === "CSV") {
        downloadCSV(data, fileName);
      } else {
        downloadPDF(data, report.name, fileName);
      }
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to generate download. Ensure backend is running.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">Reports</h1>
          <p className="text-sm text-[#94a3b8]">Generate and download asset health reports</p>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-[#3b82f6]">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <h2 className="text-sm font-medium text-[#f1f5f9] mb-4">Recent Reports</h2>
            <ReportList reports={reports} onDownload={handleDownload} />
          </div>

          {showChart && (
            <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
              <h2 className="text-sm font-medium text-[#f1f5f9] mb-4">Health Trend Preview</h2>
              <ReportChart data={mockHealthTrend} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-lg p-6">
            <h2 className="text-sm font-medium text-[#f1f5f9] mb-4">Generate New Report</h2>
            <ReportConfigForm onGenerate={handleGenerate} />
          </div>
        </div>
      </div>
    </div>
  );
}
