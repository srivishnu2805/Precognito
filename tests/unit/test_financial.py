import pytest
from datetime import datetime, timezone
from precognito.financial.services import AdminReportingService
from precognito.financial.models import (
    EngineRecommendationReport,
    SystemHealthResponse,
    AuditComplianceReport
)

def test_fetch_real_rul_and_prob(mocker):
    """Test fetching real RUL and probability from InfluxDB."""
    mock_query = mocker.patch("precognito.financial.services.query_latest_data")
    
    mock_record_rul = mocker.Mock()
    mock_record_rul.get_field.return_value = "predicted_rul_hours"
    mock_record_rul.get_value.return_value = 100.0
    
    mock_record_conf = mocker.Mock()
    mock_record_conf.get_field.return_value = "confidence"
    mock_record_conf.get_value.return_value = 0.8
    
    # First call for RUL, second call for anomaly
    mock_query.side_effect = [
        [mocker.Mock(records=[mock_record_rul])],
        [mocker.Mock(records=[mock_record_conf])]
    ]
    
    from precognito.financial.services import fetch_real_rul_and_prob
    rul, prob = fetch_real_rul_and_prob("test_machine")
    
    assert rul == 0.5  # 100.0 / 200.0
    assert prob == 0.8

def test_fetch_real_rul_and_prob_empty(mocker):
    """Test fetching with no data returned."""
    mock_query = mocker.patch("precognito.financial.services.query_latest_data")
    mock_query.return_value = []
    
    from precognito.financial.services import fetch_real_rul_and_prob
    rul, prob = fetch_real_rul_and_prob("test_machine")
    
    assert rul == 0.5  # Default
    assert prob == 0.1  # Default

def test_generate_recommendations(mocker):
    """Test generating recommendations based on mocked sensor data."""
    mocker.patch("precognito.financial.services.fetch_real_rul_and_prob", return_value=(0.05, 0.9))
    service = AdminReportingService()
    
    report = service.generate_recommendations(period="monthly", target_machine_id="M01")
    
    assert isinstance(report, EngineRecommendationReport)
    assert report.report_period == "monthly"
    assert len(report.recommendations) > 0
    
    rec = report.recommendations[0]
    assert rec.machine_id == "M01"
    assert rec.decision in ["Repair", "Replace"]
    assert "immediately" in rec.recommendation.lower()

def test_generate_recommendations_healthy(mocker):
    """Test generating recommendations for a healthy machine."""
    mocker.patch("precognito.financial.services.fetch_real_rul_and_prob", return_value=(0.9, 0.1))
    service = AdminReportingService()
    
    report = service.generate_recommendations(period="monthly", target_machine_id="M01")
    
    assert isinstance(report, EngineRecommendationReport)
    rec = report.recommendations[0]
    assert "Continue Operation" in rec.recommendation

def test_get_system_health():
    """Test generating system health response."""
    service = AdminReportingService()
    health = service.get_system_health()
    
    assert isinstance(health, SystemHealthResponse)
    assert health.status == "Healthy"
    assert health.uptime_seconds > 0
    assert 0 <= health.cpu_usage_percent <= 100
    assert 0 <= health.memory_usage_percent <= 100

def test_generate_audit_report():
    """Test generating an audit compliance report."""
    service = AdminReportingService()
    start_date = datetime.now(timezone.utc)
    end_date = datetime.now(timezone.utc)
    report = service.generate_audit_report(start_date, end_date)
    
    assert isinstance(report, AuditComplianceReport)
    assert report.total_logs == 0
    assert len(report.logs) == 0
    assert report.period_start == start_date
    assert report.period_end == end_date
