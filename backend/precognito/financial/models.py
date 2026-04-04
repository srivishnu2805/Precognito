from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EngineRecommendationRow(BaseModel):
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
    report_period: str
    recommendations: List[EngineRecommendationRow]

class SystemHealthResponse(BaseModel):
    status: str
    uptime_seconds: int
    active_user_sessions: int
    cpu_usage_percent: float
    memory_usage_percent: float
    last_check_timestamp: datetime

class AuditLogEntry(BaseModel):
    log_id: str
    user_id: str
    role: str
    action: str
    target_resource: str
    timestamp: datetime
    ip_address: str

class AuditComplianceReport(BaseModel):
    period_start: datetime
    period_end: datetime
    total_logs: int
    unauthorized_attempts: int
    logs: List[AuditLogEntry]
