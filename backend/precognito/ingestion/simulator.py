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

# Anomaly probability weights - rare but impactful
ANOMALY_TYPES = {
    "normal": 0.85,  # 85% normal operation
    "spike": 0.05,  # 5% sudden spike
    "gradual": 0.04,  # 4% gradual degradation
    "pattern": 0.03,  # 3% pattern anomaly
    "critical": 0.02,  # 2% critical failure imminent
    "drift": 0.01,  # 1% sensor drift
}


def generate_sensor_data(device_id="machine_1", anomaly_seed=None):
    """Generates synthetic sensor telemetry data with realistic anomaly patterns.

    Args:
        device_id (str, optional): The ID of the device to simulate. Defaults to "machine_1".
        anomaly_seed (int, optional): Seed for reproducibility.

    Returns:
        dict: A dictionary containing simulated sensor readings and edge features.
    """
    if anomaly_seed is not None:
        random.seed(anomaly_seed)
        np.random.seed(anomaly_seed)

    t = np.linspace(0, 1, 1000)

    # Determine operating mode based on weights
    mode = random.choices(
        list(ANOMALY_TYPES.keys()), weights=list(ANOMALY_TYPES.values())
    )[0]

    # Normal operation
    if mode == "normal":
        raw_vibration = 1.0 * np.sin(2 * np.pi * 20 * t) + np.random.normal(
            0, 0.5, 1000
        )
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
            "timestamp": datetime.now().isoformat(),
        }

    # Spike anomaly - sudden brief spike (bearing hit, foreign object)
    elif mode == "spike":
        raw_vibration = (
            2.0 * np.sin(2 * np.pi * 30 * t)
            + 4.0 * np.sin(2 * np.pi * 150 * t)
            + np.random.normal(0, 1.5, 1000)
        )
        edge_features = process_raw_edge_data(raw_vibration.tolist())

        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(302, 308),
            "vibration": random.uniform(2200, 2800),
            **edge_features,
            "torque": random.uniform(65, 85),
            "pressure": random.uniform(4, 7),
            "tool_wear": random.uniform(80, 150),
            "timestamp": datetime.now().isoformat(),
        }

    # Gradual degradation - slowly increasing vibration over time
    elif mode == "gradual":
        degradation_factor = random.uniform(1.5, 2.5)
        raw_vibration = degradation_factor * np.sin(
            2 * np.pi * 25 * t
        ) + np.random.normal(0, 0.8, 1000)
        edge_features = process_raw_edge_data(raw_vibration.tolist())

        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(300, 306),
            "vibration": random.uniform(1800, 2200),
            **edge_features,
            "torque": random.uniform(50, 65),
            "pressure": random.uniform(3, 5),
            "tool_wear": random.uniform(120, 200),
            "timestamp": datetime.now().isoformat(),
        }

    # Pattern anomaly - repetitive pattern (imbalance, looseness)
    elif mode == "pattern":
        raw_vibration = (
            3.0 * np.sin(2 * np.pi * 40 * t)
            + 2.0 * np.sin(2 * np.pi * 80 * t)
            + np.random.normal(0, 1.2, 1000)
        )
        edge_features = process_raw_edge_data(raw_vibration.tolist())

        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(304, 310),
            "vibration": random.uniform(2000, 2500),
            **edge_features,
            "torque": random.uniform(55, 75),
            "pressure": random.uniform(4, 6),
            "tool_wear": random.uniform(100, 180),
            "timestamp": datetime.now().isoformat(),
        }

    # Critical - imminent failure
    elif mode == "critical":
        raw_vibration = (
            5.0 * np.sin(2 * np.pi * 50 * t)
            + 4.0 * np.sin(2 * np.pi * 100 * t)
            + np.random.normal(0, 2, 1000)
        )
        edge_features = process_raw_edge_data(raw_vibration.tolist())

        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(310, 320),
            "vibration": random.uniform(2600, 3200),
            **edge_features,
            "torque": random.uniform(80, 100),
            "pressure": random.uniform(6, 10),
            "tool_wear": random.uniform(180, 250),
            "timestamp": datetime.now().isoformat(),
        }

    # Sensor drift - gradual offset in readings
    elif mode == "drift":
        offset = random.uniform(1.5, 2.5)
        raw_vibration = (1.0 + offset) * np.sin(2 * np.pi * 20 * t) + np.random.normal(
            0, 0.6, 1000
        )
        edge_features = process_raw_edge_data(raw_vibration.tolist())

        return {
            "device_id": device_id,
            "type": random.choice(["L", "M", "H"]),
            "temperature": random.uniform(299, 304),
            "vibration": random.uniform(1600, 2000),
            **edge_features,
            "torque": random.uniform(40, 55),
            "pressure": random.uniform(2.5, 4.5),
            "tool_wear": random.uniform(50, 120),
            "timestamp": datetime.now().isoformat(),
        }

    # Fallback to normal
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
        "timestamp": datetime.now().isoformat(),
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

    try:
        while True:
            data = generate_sensor_data(device_id)
            try:
                response = requests.post(url, json=data, headers=headers)
                if response.status_code == 200:
                    res_json = response.json()
                    severity = res_json.get("anomaly_analysis", {}).get(
                        "severity", "NORMAL"
                    )
                    rul = res_json.get("predictive_analysis", {}).get(
                        "predicted_rul_hours", 0
                    )
                    print(
                        f"HTTP 200: Device={device_id}, Severity={severity}, RUL={rul}h"
                    )
                else:
                    print(f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                print(f"HTTP Error: {e}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopping HTTP Simulator...")


def run_mqtt_simulator(broker, port, device_id, interval):
    """Runs the simulator in MQTT mode, publishing data to a broker.

    Args:
        broker (str): The MQTT broker address.
        port (int): The MQTT broker port.
        device_id (str): The ID of the device to simulate.
        interval (float): Time in seconds between transmissions.
    """
    print(f"Starting MQTT Simulator sending to {broker}:{port}...")
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.connect(broker, port, 60)

        while True:
            data = generate_sensor_data(device_id)
            topic = f"telemetry/{device_id}"
            client.publish(topic, json.dumps(data))
            print(f"MQTT Published to {topic}")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\nStopping MQTT Simulator...")
    except Exception as e:
        print(f"MQTT Simulator error: {e}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Precognito Sensor Simulator")
    parser.add_argument(
        "--mode", choices=["http", "mqtt"], default="mqtt", help="Simulator mode"
    )
    parser.add_argument(
        "--url", default="http://localhost:8000/ingest/dev", help="HTTP Ingestion URL"
    )
    parser.add_argument("--broker", default="localhost", help="MQTT Broker address")
    parser.add_argument("--port", type=int, default=1883, help="MQTT Port")
    parser.add_argument("--device", default="machine_1", help="Device ID")
    parser.add_argument(
        "--interval", type=float, default=5.0, help="Interval between readings"
    )
    parser.add_argument("--token", help="Bearer token for HTTP auth")

    args = parser.parse_args()

    if args.mode == "http":
        run_http_simulator(args.url, args.device, args.interval, args.token)
    else:
        run_mqtt_simulator(args.broker, args.port, args.device, args.interval)
