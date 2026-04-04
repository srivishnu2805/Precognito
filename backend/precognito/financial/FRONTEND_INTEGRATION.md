# Frontend Integration for Module 5 (Admin & Executive Reporting)

## Overview
Module 5 provides three main endpoints for the **Executive Decision Support Dashboard**. The frontend (React PWA) should integrate these to present ROI analysis, system health, and audit logs to the appropriate roles (e.g., Executive Manager, System Admin).

## Available Endpoints

---

### 1. Engine Recommendations (Phases 1-6)
- **Endpoint**: `GET /admin-reporting/recommendations?period={monthly|quarterly}&machine_id=M01`
- **Response Shape**:
```json
{
  "report_period": "monthly",
  "recommendations": [
    {
      "machine_id": "M01",
      "component": "Rolling Element Bearing",
      "rul": 0.45,
      "failure_probability": 0.12,
      "repair_cost": 406.0,
      "replacement_cost": 1015.0,
      "labour_cost": 120.0,
      "assigned_mechanic": "MECH_11 (Junior Bearings)",
      "final_cost": 631.2,
      "decision": "Repair",
      "recommendation": "Schedule Repair.",
      "explanation": "Routine processing. RUL Status is Healthy."
    }
  ]
}
```
- **Frontend Action Items**:
  - **Visualization Data Table**: Render each item in the `recommendations` array as a row in a comprehensive Management Datatable. The user checklist specifically demands showing Every Single Field included in the response.
  - **KPI Aggregates**: Use standard array `reduce` functions on the frontend to calculate the sum `final_cost` vs sum `replacement_cost` if you want a dashboard-level savings KPI.
  - **Urgency Highlighting**: Apply dynamic styling to rows where `decision == "Replace"` or `recommendation` includes `"immediately"` (e.g., Red backgrounds for immediate actions).

---

### 2. System Health Monitoring (FR 5.2)
- **Endpoint**: `GET /admin-reporting/health`
- **Response Shape**:
```json
{
  "status": "Healthy",
  "uptime_seconds": 345600,
  "active_user_sessions": 24,
  "cpu_usage_percent": 35.5,
  "memory_usage_percent": 60.1,
  "last_check_timestamp": "2026-04-03T18:47:47Z"
}
```
- **Frontend Action Items**:
  - **Status Widget**: Show a standard "System Status" widget with a Green/Red indicator based on the `status` value.
  - **Formatting**: Format `uptime_seconds` into a human-readable string (e.g., "4 days, 2 hours").
  - **Gauges**: Use Circular Progress Indicators or Gauges for `cpu_usage_percent` and `memory_usage_percent`.

---

### 3. Audit Compliance Logs (FR 5.3)
- **Endpoint**: `GET /admin-reporting/audit?start_date={timestamp}&end_date={timestamp}`
- **Response Shape**: 
```json
{
  "period_start": "2026-03-04T18:47:47Z",
  "period_end": "2026-04-03T18:47:47Z",
  "total_logs": 3,
  "unauthorized_attempts": 0,
  "logs": [
    {
      "log_id": "LOG-4491",
      "user_id": "sanjay_lead",
      "role": "Maintenance Lead",
      "action": "Approved Work Order WO-102",
      "target_resource": "WorkOrder",
      "timestamp": "2026-04-03T16:47:47Z",
      "ip_address": "192.168.1.105"
    }
  ]
}
```
- **Frontend Action Items**:
  - **Table View**: Present the `logs` array as a paginated Data Table. Note: this page should only be accessible if the user role is `Admin` or `Security Officer`.
  - **Export Feature**: Provide a "Export to PDF / CSV" button. For this MVP, you can use a library like `jspdf` or `papaparse` client-side to take the JSON array and offer it as a download, fulfilling the "Export for Compliance" requirement.
  - **Filtering**: Implement local filters in the table to search by `role` or `action`.
