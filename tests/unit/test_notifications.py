import pytest
from precognito.notifications import send_external_notification, notify_critical_anomaly

def test_send_notification(mocker):
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.status_code = 200
    
    send_external_notification("Title", "Message", priority="high")
    
    assert mock_post.called
    args, kwargs = mock_post.call_args
    assert args[0] == "https://ntfy.sh/precognito_alerts_demo"
    assert kwargs["headers"]["Title"] == "Title"
    assert kwargs["headers"]["Priority"] == "high"

def test_notify_critical_anomaly(mocker):
    mock_send = mocker.patch("precognito.notifications.send_external_notification")
    
    notify_critical_anomaly("device_123", "Bearing Wear")
    
    assert mock_send.called
    args, kwargs = mock_send.call_args
    assert "🚨 CRITICAL ANOMALY: device_123" in kwargs["title"]
    assert "Bearing Wear" in kwargs["message"]
    assert kwargs["priority"] == "urgent"
