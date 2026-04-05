"""
Sensor simulation module for generating and sending synthetic telemetry data.
"""
import random
import time
import json
import requests
import argparse
import sys
import os
from datetime import datetime

# Add the backend directory to sys.path to allow imports
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, "..", ".."))
if backend_dir not in sys.path:
    sys.path.append(backend_dir)

import paho.mqtt.client as mqtt
import numpy as np
from precognito.ingestion.dsp import process_raw_edge_data

def generate_sensor_data(device_id="machine_1"):
    """Generates synthetic sensor telemetry data.

    Args:
        device_id (str, optional): The ID of the device to simulate. Defaults to "machine_1".

    Returns:
        dict: A dictionary containing simulated sensor readings and edge features.
    """
    # Normal ranges based on SENSOR_CONFIG in anomaly/core.py
    # temperature: 295-305, vibration: 1000-2000, torque: 20-60
    
    # Simulate high-frequency raw vibration data (1000 samples = 1s at 1kHz)
    t = np.linspace(0, 1, 1000)
    is_anomaly = random.random() < 0.1
    
    if is_anomaly:
        # Complex wave with higher frequency components and noise
        # 50Hz (misalignment) + 100Hz (bearing) + noise
        raw_vibration = 5.0 * np.sin(2 * np.pi * 50 * t) + 3.0 * np.sin(2 * np.pi * 100 * t) + np.random.normal(0, 2, 1000)
        
        # Calculate features locally (Edge Simulation)
        edge_features = process_raw_edge_data(raw_vibration.tolist())
        
        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(310, 320),
            "vibration": random.uniform(2500, 3000), # Total energy
            **edge_features,
            "torque": random.uniform(80, 100),
            "pressure": random.uniform(5, 10),
            "tool_wear": random.uniform(180, 250),
            "timestamp": datetime.now().isoformat()
        }
    
    # Healthy wave
    raw_vibration = 1.0 * np.sin(2 * np.pi * 20 * t) + np.random.normal(0, 0.5, 1000)
    edge_features = process_raw_edge_data(raw_vibration.tolist())
    
    return {
        "device_id": device_id,
        "type": random.choice(["L", "M", "H"]),
        "temperature": random.uniform(298, 302),
        "vibration": random.uniform(1400, 1600),
        **edge_features,
        "torque": random.uniform(35, 45),
        "pressure": random.uniform(2, 4),
        "tool_wear": random.uniform(10, 100),
        "timestamp": datetime.now().isoformat()
    }

def run_http_simulator(url, device_id, interval, auth_token):
    """Runs the simulator in HTTP mode, sending data to a specified URL.

    Args:
        url (str): The ingestion endpoint URL.
        device_id (str): The ID of the device to simulate.
        interval (float): Time in seconds between transmissions.
        auth_token (str): Bearer token for authentication.
    """
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
    """Runs the simulator in MQTT mode, publishing data to a broker.

    Args:
        broker (str): The MQTT broker address.
        port (int): The MQTT broker port.
        device_id (str): The ID of the device to simulate.
        interval (float): Time in seconds between transmissions.
    """
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
    parser.add_argument("--interval", type=float, default=5.0, help="Interval between readings")
    parser.add_argument("--token", help="Bearer token for HTTP auth")
    
    args = parser.parse_args()
    
    if args.mode == "http":
        run_http_simulator(args.url, args.device, args.interval, args.token)
    else:
        run_mqtt_simulator(args.broker, args.port, args.device, args.interval)
