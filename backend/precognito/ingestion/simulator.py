import random
import time
from datetime import datetime

def generate_sensor_data():
    return {
        "device_id": "machine_1",
        "temperature": random.uniform(20, 100),
        "vibration": random.uniform(0, 10),
        "pressure": random.uniform(1, 5),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    while True:
        print(generate_sensor_data())
        time.sleep(2)