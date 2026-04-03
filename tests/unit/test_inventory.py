import pytest
from precognito.inventory.api import get_inventory, reserve_part, get_jit_procurement_alerts

def test_get_inventory(mocker):
    mock_db = mocker.Mock()
    mock_items = [
        mocker.Mock(id=1, partName="Part A", partNumber="P1", quantity=10, minThreshold=5, leadTimeDays=7, costPerUnit=10.0, category="Bearings"),
        mocker.Mock(id=2, partName="Part B", partNumber="P2", quantity=2, minThreshold=5, leadTimeDays=3, costPerUnit=20.0, category="Belts")
    ]
    mock_db.query.return_value.all.return_value = mock_items
    
    result = get_inventory(mock_db)
    
    assert len(result) == 2
    assert result[0]["status"] == "IN_STOCK"
    assert result[1]["status"] == "LOW_STOCK"

def test_reserve_part_insufficient_stock(mocker):
    mock_db = mocker.Mock()
    mock_part = mocker.Mock(id=1, quantity=2)
    mock_db.query.return_value.filter.return_value.first.return_value = mock_part
    
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as excinfo:
        reserve_part({"partId": 1, "quantity": 5}, mock_db)
    
    assert excinfo.value.status_code == 400
    assert "Insufficient stock" in excinfo.value.detail

def test_get_jit_alerts(mocker):
    mock_db = mocker.Mock()
    mock_get_all = mocker.patch("precognito.ingestion.influx_client.get_all_devices")
    mock_get_all.return_value = ["device_1"]
    
    # Correct mock path for where it is USED in inventory/api.py
    mock_query_latest = mocker.patch("precognito.inventory.api.query_latest_data")
    # Simulate RUL = 50 hours (very low)
    mock_record = mocker.Mock()
    mock_record.get_field.return_value = "predicted_rul_hours"
    mock_record.get_value.return_value = 50.0
    mock_table = mocker.Mock(records=[mock_record])
    mock_query_latest.return_value = [mock_table]
    
    # Mock part with lead time 7 days (168 hours)
    mock_part = mocker.Mock(partName="Bearing", leadTimeDays=7, category="Bearings")
    mock_db.query.return_value.filter.return_value.first.return_value = mock_part
    
    result = get_jit_procurement_alerts(mock_db)
    
    assert len(result) == 1
    assert result[0]["deviceId"] == "device_1"
    assert result[0]["priority"] == "CRITICAL"
