"""Financial and reporting models for the Precognito system.

This module defines the Pydantic models used for financial recommendations,
system health monitoring, and audit compliance reporting.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EngineRecommendationRow(BaseModel):
    """Represents a single row in an engine recommendation report.

    Attributes:
        machine_id (str): The unique identifier of the machine.
        component (str): The name of the component.
        rul (float): Remaining Useful Life (normalized 0.0 to 1.0).
        failure_probability (float): Probability of failure (0.0 to 1.0).
        repair_cost (float): Estimated cost to repair the component.
        replacement_cost (float): Estimated cost to replace the component.
        labour_cost (float): Estimated labour cost for the action.
        assigned_mechanic (str): Name and details of the assigned mechanic.
        final_cost (float): The final calculated cost of the recommended action.
        decision (str): The recommended action (e.g., "Repair", "Replace").
        recommendation (str): Short summary of the recommendation.
        explanation (str): Detailed explanation for the recommendation.
    """
    machine_id: str
    component: str
    rul: float
    failure_probability: float
    repair_cost: float
    replacement_cost: float
    labour_cost: float
    assigned_mechanic: str
    final_cost: float
    decision: str
    recommendation: str
    explanation: str

class EngineRecommendationReport(BaseModel):
    """A collection of recommendations for a specific reporting period.

    Attributes:
        report_period (str): The period for which the report was generated.
        recommendations (List[EngineRecommendationRow]): List of individual component recommendations.
    """
    report_period: str
    recommendations: List[EngineRecommendationRow]

class SystemHealthResponse(BaseModel):
    """System health metrics and status.

    Attributes:
        status (str): Overall system status (e.g., "Healthy").
        uptime_seconds (int): Total system uptime in seconds.
        active_user_sessions (int): Number of currently active user sessions.
        cpu_usage_percent (float): Current CPU usage as a percentage.
        memory_usage_percent (float): Current memory usage as a percentage.
        last_check_timestamp (datetime): Timestamp of the last health check.
    """
    status: str
    uptime_seconds: int
    active_user_sessions: int
    cpu_usage_percent: float
    memory_usage_percent: float
    last_check_timestamp: datetime

class AuditLogEntry(BaseModel):
    """A single entry in the audit log.

    Attributes:
        log_id (str): Unique identifier for the log entry.
        user_id (str): Identifier of the user who performed the action.
        role (str): Role of the user at the time of the action.
        action (str): Description of the action performed.
        target_resource (str): The resource affected by the action.
        timestamp (datetime): When the action occurred.
        ip_address (str): IP address from which the action was initiated.
    """
    log_id: str
    user_id: str
    role: str
    action: str
    target_resource: str
    timestamp: datetime
    ip_address: str

class AuditComplianceReport(BaseModel):
    """A report summarizing audit logs over a period.

    Attributes:
        period_start (datetime): Start of the reporting period.
        period_end (datetime): End of the reporting period.
        total_logs (int): Total number of logs in this period.
        unauthorized_attempts (int): Number of unauthorized access attempts.
        logs (List[AuditLogEntry]): List of detailed log entries.
    """
    period_start: datetime
    period_end: datetime
    total_logs: int
    unauthorized_attempts: int
    logs: List[AuditLogEntry]
