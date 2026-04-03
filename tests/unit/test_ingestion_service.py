import pytest
from precognito.ingestion.core import process_ingestion

def test_process_ingestion_success(mocker):
    # Mock external dependencies
    mock_save_sensor = mocker.patch("precognito.ingestion.core.save_sensor_data")
    mock_save_anomaly = mocker.patch("precognito.ingestion.core.save_anomaly_result")
    mock_save_predictive = mocker.patch("precognito.ingestion.core.save_predictive_result")
    mock_detect_anomaly = mocker.patch("precognito.ingestion.core.detect_anomaly")
    mock_predict_rul = mocker.patch("precognito.ingestion.core.predict_rul")
    mock_update_heartbeat = mocker.patch("precognito.ingestion.core.update_heartbeat")
    mock_check_status = mocker.patch("precognito.ingestion.core.check_device_status")
    mock_check_alerts = mocker.patch("precognito.ingestion.core.check_alerts")
    mock_check_thermal = mocker.patch("precognito.ingestion.core.check_sustained_thermal")

    # Set mock return values
    mock_detect_anomaly.return_value = {"anomaly_detected": False, "severity": "LOW", "reason": "None"}
    mock_predict_rul.return_value = {"predicted_rul_hours": 100.0, "risk_level": "Normal"}
    mock_check_status.return_value = "Active"
    mock_check_alerts.return_value = "NORMAL"
    mock_check_thermal.return_value = False

    raw_data = {
        "temperature": 300.0,
        "vibration": 1500.0,
        "torque": 40.0
    }
    device_id = "machine_1"

    result = process_ingestion(device_id, raw_data)

    assert result["device_id"] == device_id
    assert result["device_status"] == "Active"
    assert result["anomaly_analysis"]["anomaly_detected"] is False
    assert result["predictive_analysis"]["predicted_rul_hours"] == 100.0
    
    # Verify mocks were called
    assert mock_save_sensor.called
    assert mock_save_anomaly.called
    assert mock_save_predictive.called
    assert mock_detect_anomaly.called
    assert mock_predict_rul.called

def test_process_ingestion_missing_device_id(mocker):
    result = process_ingestion(None, {"temp": 30})
    assert result is None
