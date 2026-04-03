from datetime import datetime

device_status = {}

def update_heartbeat(device_id):
    device_status[device_id] = datetime.now()

def check_device_status(device_id):
    last_seen = device_status.get(device_id)

    if not last_seen:
        return "No Data"

    diff = (datetime.now() - last_seen).seconds

    if diff > 5:
        return "Sensor Not Transmitting"
    return "Active"