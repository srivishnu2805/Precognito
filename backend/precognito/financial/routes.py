from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from typing import Optional
from .models import ROIReportResponse, SystemHealthResponse, AuditComplianceReport
from .services import AdminReportingService

router = APIRouter(
    prefix="/admin-reporting",
    tags=["Admin & Executive Reporting"]
)

def get_reporting_service():
    return AdminReportingService()

@router.get("/recommendations", response_model=EngineRecommendationReport)
def get_recommendations(
    period: str = "monthly", 
    machine_id: Optional[str] = None,
    service: AdminReportingService = Depends(get_reporting_service)
):
    """
    Get Actionable Recommendations for a machine or all machines. 
    (Satisfies Phase 6 Output for Engine Module)
    """
    return service.generate_recommendations(period, machine_id)

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(service: AdminReportingService = Depends(get_reporting_service)):
    """
    Get current system health metrics including uptime and active sessions.
    (Satisfies FR 5.2: System Health Monitoring)
    """
    return service.get_system_health()

@router.get("/audit", response_model=AuditComplianceReport)
def get_audit_report(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None,
    service: AdminReportingService = Depends(get_reporting_service)
):
    """
    Generate an audit compliance report containing logs of user actions.
    (Satisfies FR 5.3: Audit Compliance)
    """
    # Default to last 30 days if no date provided
    if not start_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    if not end_date:
        end_date = datetime.now(timezone.utc)
        
    return service.generate_audit_report(start_date, end_date)
