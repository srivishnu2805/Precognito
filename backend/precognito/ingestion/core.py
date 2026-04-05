"""
Core ingestion module that orchestrates the processing of incoming sensor data.
"""

import logging
from precognito.ingestion.preprocess import preprocess
from precognito.ingestion.heartbeat import update_heartbeat, check_device_status
from precognito.ingestion.alerts import check_alerts
from precognito.ingestion.influx_client import (
    save_sensor_data,
    save_anomaly_result,
    save_predictive_result,
    check_sustained_thermal,
)
from precognito.anomaly.core import detect_anomaly
from precognito.predictive.predictive_engine import predict_rul
from precognito.work_orders.utils import create_automatic_work_order

logger = logging.getLogger(__name__)


def process_ingestion(device_id: str, raw_data: dict):
    """Core logic for processing incoming sensor data from any source.

    Performs preprocessing, heartbeat updates, anomaly detection, predictive analysis,
    safety checks, and saves results to InfluxDB. Also triggers notifications and
    automatic work orders based on detection results.

    Args:
        device_id: The unique identifier of the device.
        raw_data: The raw telemetry data received from the sensor.

    Returns:
        dict: A dictionary containing the results of all processing steps,
        including status, anomaly analysis, predictive analysis,
        safety analysis, and alert level. Returns None if device_id is missing.
    """
    if not device_id:
        logger.error("device_id is required for ingestion")
        return None

    # 1. Preprocess
    processed = preprocess(raw_data)

    # 2. Update status/heartbeat
    update_heartbeat(device_id)
    status = check_device_status(device_id)

    # 3. Detect Anomaly
    anomaly_input = {**processed, "machine_id": device_id}
    anomaly_result = detect_anomaly(anomaly_input)

    severity = anomaly_result.get("severity", "LOW")
    reason = anomaly_result.get("reason", "Unknown fault detected")

    # Trigger external notification if critical
    # DISABLED FOR SIMULATOR DEMO - notify_critical_anomaly(device_id, reason)

    # US-4.1: Automated Work Order Creation
    if severity in ["HIGH", "CRITICAL"] and anomaly_result.get("anomaly_detected"):
        create_automatic_work_order(device_id, severity, reason)

    # 4. Predict RUL
    predictive_result = predict_rul(processed)

    # 5. Thermal Safety Check (US-6.1: T > Baseline for 5+ minutes)
    is_sustained_thermal = check_sustained_thermal(
        device_id, threshold=70.0, window="5m"
    )

    # DISABLED FOR SIMULATOR DEMO - if is_sustained_thermal:
    #     notify_safety_alert(device_id, processed.get("temperature", 0.0))

    safety_alert = {
        "sustained_thermal": is_sustained_thermal,
        "current_temp": processed.get("temperature", 0.0),
        "threshold": 70.0,
    }

    # 6. Save to InfluxDB
    try:
        save_sensor_data(device_id, processed)
        save_anomaly_result(device_id, anomaly_result)
        save_predictive_result(device_id, predictive_result)

        if is_sustained_thermal:
            from influxdb_client import Point, WritePrecision
            from precognito.ingestion.influx_client import (
                write_api,
                INFLUX_BUCKET,
                INFLUX_ORG,
            )
            from datetime import datetime, timezone

            point = (
                Point("safety_alerts")
                .tag("device_id", device_id)
                .tag("type", "sustained_thermal")
                .field("temperature", float(processed.get("temperature", 0.0)))
                .field("active", True)
                .time(datetime.now(timezone.utc), WritePrecision.NS)
            )
            write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)

    except Exception as e:
        logger.error(f"Failed to save to InfluxDB: {e}")

    # 7. Check traditional alerts
    alert = check_alerts(processed)

    return {
        "device_id": device_id,
        "processed_data": processed,
        "device_status": status,
        "anomaly_analysis": anomaly_result,
        "predictive_analysis": predictive_result,
        "safety_analysis": safety_alert,
        "alert": alert,
    }
