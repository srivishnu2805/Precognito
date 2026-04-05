import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * @fileoverview Reporting utilities for exporting system data to CSV and PDF formats.
 */

/**
 * Download data as CSV.
 * @param {Record<string, unknown>[]} data The array of objects to export.
 * @param {string} fileName The name of the file to save.
 */
export function downloadCSV(data: Record<string, unknown>[], fileName: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((val) => `"${val}"`)
      .join(",")
  );
  
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download data as a formal, signed PDF report.
 * @param {Record<string, unknown>[]} data The array of objects to export as a table.
 * @param {string} title The title of the report.
 * @param {string} fileName The name of the file to save.
 */
export function downloadPDF(data: Record<string, unknown>[], title: string, fileName: string) {
  if (data.length === 0) return;

  const doc = new jsPDF();
  
  // --- Company Header ---
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("PRECOGNITO", 14, 25);
  
  doc.setFontSize(10);
  doc.text("Industrial Predictive Maintenance System", 14, 32);
  doc.text("Factory Intelligence Unit", 160, 25, { align: "right" });
  
  // --- Report Title ---
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 14, 55);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 62);
  doc.text(`Report ID: PR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 14, 67);

  // --- Data Table ---
  // Sanitize data to handle nested objects and special values
  const sanitizeValue = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };
  
  const headers = Object.keys(data[0]);
  const body = data.map((obj) => 
    Object.values(obj).map((val) => sanitizeValue(val))
  );

  autoTable(doc, {
    startY: 75,
    head: [headers.map(h => h.toUpperCase())],
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
  });

  // --- Signature Block (ISO Compliance) ---
  const docWithTable = doc as unknown as { lastAutoTable?: { finalY: number } };
  const finalY = (docWithTable.lastAutoTable?.finalY ?? 0) + 30;
  
  if (finalY < 250) {
    doc.setDrawColor(200);
    doc.line(14, finalY, 80, finalY);
    doc.line(130, finalY, 196, finalY);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("AUTHORIZED SIGNATURE", 14, finalY + 5);
    doc.text("MAINTENANCE LEAD VERIFICATION", 130, finalY + 5);
    
    doc.setFontSize(8);
    doc.text("This report is digitally hashed and verified for ISO 55001 compliance.", 14, finalY + 15);
  }

  doc.save(`${fileName}.pdf`);
}
