"""API routes for financial and administrative reporting.

This module provides endpoints for fetching machine recommendations,
system health metrics, and audit compliance reports.
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from typing import Optional
from .models import EngineRecommendationReport, SystemHealthResponse, AuditComplianceReport
from .services import AdminReportingService

router = APIRouter(
    prefix="/admin-reporting",
    tags=["Admin & Executive Reporting"]
)

def get_reporting_service() -> AdminReportingService:
    """Dependency provider for AdminReportingService.

    Returns:
        AdminReportingService: An instance of the reporting service.
    """
    return AdminReportingService()

@router.get("/recommendations", response_model=EngineRecommendationReport)
def get_recommendations(
    period: str = "monthly", 
    machine_id: Optional[str] = None,
    service: AdminReportingService = Depends(get_reporting_service)
) -> EngineRecommendationReport:
    """Get actionable recommendations for a machine or all machines.

    (Satisfies Phase 6 Output for Engine Module)

    Args:
        period (str): The reporting period (e.g., "monthly", "weekly"). Defaults to "monthly".
        machine_id (Optional[str]): Unique identifier of a specific machine to filter by. Defaults to None.
        service (AdminReportingService): The reporting service instance.

    Returns:
        EngineRecommendationReport: A report containing individual component recommendations.
    """
    return service.generate_recommendations(period, machine_id)

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(
    service: AdminReportingService = Depends(get_reporting_service)
) -> SystemHealthResponse:
    """Get current system health metrics including uptime and active sessions.

    (Satisfies FR 5.2: System Health Monitoring)

    Args:
        service (AdminReportingService): The reporting service instance.

    Returns:
        SystemHealthResponse: Current status, uptime, and resource usage metrics.
    """
    return service.get_system_health()

@router.get("/audit", response_model=AuditComplianceReport)
def get_audit_report(
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None,
    service: AdminReportingService = Depends(get_reporting_service)
) -> AuditComplianceReport:
    """Generate an audit compliance report containing logs of user actions.

    (Satisfies FR 5.3: Audit Compliance)

    Args:
        start_date (Optional[datetime]): Start of the reporting range. Defaults to 30 days ago.
        end_date (Optional[datetime]): End of the reporting range. Defaults to now.
        service (AdminReportingService): The reporting service instance.

    Returns:
        AuditComplianceReport: A report summarizing audit logs for the period.
    """
    # Default to last 30 days if no date provided
    if not start_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    if not end_date:
        end_date = datetime.now(timezone.utc)
        
    return service.generate_audit_report(start_date, end_date)
