"""
InfluxDB client module for saving and querying sensor telemetry and analysis results.
"""

import os
import logging
from datetime import datetime, timezone
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import WriteOptions
from dotenv import load_dotenv

from precognito.utils import influx_read_breaker, influx_write_breaker

load_dotenv()
logger = logging.getLogger(__name__)

# InfluxDB Configuration
INFLUX_URL = os.getenv("INFLUX_URL", "http://localhost:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
if not INFLUX_TOKEN:
    logger.error("INFLUX_TOKEN is missing!")
INFLUX_ORG = os.getenv("INFLUX_ORG", "precognito_org")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "precognito_bucket")

client = InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)

# Configure asynchronous batch writes for industrial performance
write_options = WriteOptions(
    batch_size=100,  # Number of points to write in a single batch
    flush_interval=1000,  # Maximum time to wait before flushing (ms)
    retry_interval=5000,  # Time to wait before retrying (ms)
    max_retries=3,  # Maximum number of retries
    max_retry_delay=30000,  # Maximum delay between retries (ms)
)

write_api = client.write_api(write_options=write_options)
query_api = client.query_api()


@influx_write_breaker
def save_sensor_data(device_id: str, data: dict):
    """Saves raw sensor data to InfluxDB.

    Args:
        device_id: The ID of the device sending the data.
        data: A dictionary containing sensor readings.
    """
    point = (
        Point("machine_telemetry")
        .tag("device_id", device_id)
        .time(datetime.now(timezone.utc), WritePrecision.NS)
    )

    for key, value in data.items():
        if isinstance(value, (int, float)):
            point.field(key, float(value))
        elif isinstance(value, str):
            point.field(key, value)

    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)


@influx_write_breaker
def save_anomaly_result(device_id: str, result: dict):
    """Saves anomaly detection results to InfluxDB.

    Args:
        device_id: The ID of the device.
        result: A dictionary containing anomaly results (severity, confidence, etc.).
    """
    point = (
        Point("anomaly_results")
        .tag("device_id", device_id)
        .tag("severity", result.get("severity", "LOW"))
        .field("anomaly_detected", bool(result.get("anomaly_detected", False)))
        .field("confidence", float(result.get("confidence", 0.0)))
        .time(datetime.now(timezone.utc), WritePrecision.NS)
    )

    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)


@influx_write_breaker
def save_predictive_result(device_id: str, result: dict):
    """Saves RUL and fault prediction results to InfluxDB.

    Args:
        device_id: The ID of the device.
        result: A dictionary containing predictive results (risk_level, rul_hours, etc.).
    """
    point = (
        Point("predictive_results")
        .tag("device_id", device_id)
        .tag("risk_level", result.get("risk_level", "Normal"))
        .tag("predicted_fault_type", result.get("predicted_fault_type", "None"))
        .field("predicted_rul_hours", float(result.get("predicted_rul_hours", 0.0)))
        .field(
            "confidence_score_percent",
            float(result.get("confidence_score_percent", 0.0)),
        )
        .time(datetime.now(timezone.utc), WritePrecision.NS)
    )

    write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)


@influx_read_breaker
def query_latest_data(device_id: str, measurement: str = "machine_telemetry"):
    """Queries the latest data for a specific device and measurement.

    Args:
        device_id: The ID of the device.
        measurement: The measurement name in InfluxDB. Defaults to "machine_telemetry".

    Returns:
        The result of the InfluxDB query.
    """
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "{measurement}") |> filter(fn: (r) => r["device_id"] == "{device_id}") |> last()'
    return query_api.query(query, org=INFLUX_ORG)


@influx_read_breaker
def query_historical_data(device_id: str, measurement: str, range_start: str = "-24h"):
    """Queries historical data for a device over a specific time range.

    Args:
        device_id: The ID of the device.
        measurement: The measurement name in InfluxDB.
        range_start: The start of the time range (e.g., "-24h"). Defaults to "-24h".

    Returns:
        The result of the InfluxDB query.
    """
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: {range_start}) |> filter(fn: (r) => r["_measurement"] == "{measurement}") |> filter(fn: (r) => r["device_id"] == "{device_id}") |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")'
    return query_api.query(query, org=INFLUX_ORG)


@influx_read_breaker
def get_all_devices(measurement: str = "machine_telemetry"):
    """Retrieves a list of all unique device IDs that have sent data.

    Args:
        measurement: The measurement name to check. Defaults to "machine_telemetry".

    Returns:
        list: A list of unique device IDs.
    """
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -30d) |> filter(fn: (r) => r["_measurement"] == "{measurement}") |> keep(columns: ["device_id"]) |> unique(column: "device_id")'
    tables = query_api.query(query, org=INFLUX_ORG)
    devices = []
    for table in tables:
        for record in table.records:
            devices.append(record.values.get("device_id"))
    return list(set(devices))


@influx_read_breaker
def get_total_telemetry_count(range_start: str = "-30d"):
    """Returns the total number of telemetry points received in the given range.

    Args:
        range_start: The start of the time range. Defaults to "-30d".

    Returns:
        int: Total number of telemetry points.
    """
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: {range_start}) |> filter(fn: (r) => r["_measurement"] == "machine_telemetry") |> count()'
    tables = query_api.query(query, org=INFLUX_ORG)

    total = 0
    for table in tables:
        for record in table.records:
            total += record.get_value()
    return total


@influx_read_breaker
def check_sustained_thermal(
    device_id: str, threshold: float = 70.0, window: str = "5m"
):
    """Checks if temperature has been sustained above a threshold.

    Args:
        device_id: The ID of the device.
        threshold: The temperature threshold. Defaults to 70.0.
        window: The time window to check (e.g., "5m"). Defaults to "5m".

    Returns:
        bool: True if sustained thermal above threshold, False otherwise.
    """
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -{window}) |> filter(fn: (r) => r["_measurement"] == "machine_telemetry") |> filter(fn: (r) => r["device_id"] == "{device_id}") |> filter(fn: (r) => r["_field"] == "temperature")'
    tables = query_api.query(query, org=INFLUX_ORG)

    values = []
    for table in tables:
        for record in table.records:
            values.append(record.get_value())

    if not values:
        return False

    return all(v > threshold for v in values)
