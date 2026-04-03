import random
import time
import json
import requests
import argparse
from datetime import datetime
import paho.mqtt.client as mqtt

def generate_sensor_data(device_id="machine_1"):
    # Normal ranges based on SENSOR_CONFIG in anomaly/core.py
    # temperature: 295-305, vibration: 1000-2000, torque: 20-60
    
    # Introduce occasional anomalies
    is_anomaly = random.random() < 0.1
    
    if is_anomaly:
        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(310, 320),
            "vibration": random.uniform(2500, 3000),
            "vibration_rms": random.uniform(6.0, 10.0),
            "torque": random.uniform(80, 100),
            "pressure": random.uniform(5, 10),
            "tool_wear": random.uniform(180, 250),
            "freq_spike_1x": random.uniform(0.8, 1.5),
            "freq_spike_bpfo": random.uniform(0.5, 1.2),
            "timestamp": datetime.now().isoformat()
        }
    
    return {
        "device_id": device_id,
        "type": random.choice(["L", "M", "H"]),
        "temperature": random.uniform(298, 302),
        "vibration": random.uniform(1400, 1600),
        "vibration_rms": random.uniform(1.0, 2.5),
        "torque": random.uniform(35, 45),
        "pressure": random.uniform(2, 4),
        "tool_wear": random.uniform(10, 100),
        "freq_spike_1x": random.uniform(0.0, 0.2),
        "freq_spike_bpfo": random.uniform(0.0, 0.1),
        "timestamp": datetime.now().isoformat()
    }

def run_http_simulator(url, device_id, interval, auth_token):
    print(f"Starting HTTP Simulator sending to {url}...")
    headers = {}
    if auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    
    while True:
        data = generate_sensor_data(device_id)
        try:
            response = requests.post(url, json=data, headers=headers)
            if response.status_code == 200:
                res_json = response.json()
                severity = res_json.get('anomaly_analysis', {}).get('severity', 'NORMAL')
                rul = res_json.get('predictive_analysis', {}).get('predicted_rul_hours', 0)
                print(f"HTTP 200: Device={device_id}, Severity={severity}, RUL={rul}h")
            else:
                print(f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            print(f"HTTP Error: {e}")
        time.sleep(interval)

def run_mqtt_simulator(broker, port, device_id, interval):
    print(f"Starting MQTT Simulator sending to {broker}:{port}...")
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.connect(broker, port, 60)
    
    while True:
        data = generate_sensor_data(device_id)
        topic = f"telemetry/{device_id}"
        client.publish(topic, json.dumps(data))
        print(f"MQTT Published to {topic}")
        time.sleep(interval)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Precognito Sensor Simulator")
    parser.add_argument("--mode", choices=["http", "mqtt"], default="mqtt", help="Simulator mode")
    parser.add_argument("--url", default="http://localhost:8000/ingest/dev", help="HTTP Ingestion URL")
    parser.add_argument("--broker", default="localhost", help="MQTT Broker address")
    parser.add_argument("--port", type=int, default=1883, help="MQTT Port")
    parser.add_argument("--device", default="machine_1", help="Device ID")
    parser.add_argument("--interval", type=float, default=2.0, help="Interval between readings")
    parser.add_argument("--token", help="Bearer token for HTTP auth")
    
    args = parser.parse_args()
    
    if args.mode == "http":
        run_http_simulator(args.url, args.device, args.interval, args.token)
    else:
        run_mqtt_simulator(args.broker, args.port, args.device, args.interval)
