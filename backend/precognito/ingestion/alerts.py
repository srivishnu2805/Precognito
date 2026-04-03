def check_alerts(data):
    if data["vibration"] > 8:
        return "CRITICAL"
    elif data["vibration"] > 5:
        return "WARNING"
    return "NORMAL"