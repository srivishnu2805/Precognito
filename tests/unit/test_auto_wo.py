import pytest
from precognito.work_orders.utils import create_automatic_work_order

def test_create_auto_wo_skips_if_exists(mocker):
    # Mock database session and query
    mock_db = mocker.patch("precognito.work_orders.utils.SessionLocal")
    mock_session = mock_db.return_value
    
    # Simulate an existing active work order
    mock_session.query.return_value.filter.return_value.first.return_value = True
    
    result = create_automatic_work_order("machine_1", "HIGH", "Reason")
    
    assert result is None
    assert not mock_session.add.called

def test_create_auto_wo_success(mocker):
    mock_db = mocker.patch("precognito.work_orders.utils.SessionLocal")
    mock_session = mock_db.return_value
    
    # No existing work order
    mock_session.query.return_value.filter.return_value.first.side_effect = [None, mocker.Mock(userId="tech_1")]
    
    result = create_automatic_work_order("machine_1", "CRITICAL", "Vibration Spike")
    
    assert mock_session.add.called
    assert mock_session.commit.called
