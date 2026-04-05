"""
Main FastAPI application entry point for the Precognito backend.
Coordinates database connections, authentication, auditing, and routing.
"""

import os
import logging
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from dotenv import load_dotenv
import asyncpg
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from .logging_utils import setup_logging

# Import dependencies
from .auth import get_db_pool, admin_only, lead_above, authenticated_user

# Import routers from other modules
from .work_orders.api import router as workorder_router
from .inventory.api import router as inventory_router
from .financial.routes import (
    router as financial_router,
    get_reporting_service,
)
from .financial.models import OEEMetricsResponse

# Initialize logging before app definition
setup_logging()
logger = logging.getLogger(__name__)

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL environment variable is not set!")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Context manager for handling application startup and shutdown events.

    Args:
        app: The FastAPI application instance.
    """
    # Startup: Initialize DB Pool
    app.db_pool = await asyncpg.create_pool(DATABASE_URL)
    yield
    # Shutdown: Close DB Pool
    if hasattr(app, "db_pool"):
        await app.db_pool.close()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(lifespan=lifespan)

# Trust proxy headers
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

# Enforce HTTPS in non-dev environments
if os.getenv("ENFORCE_HTTPS", "False").lower() == "true":
    app.add_middleware(HTTPSRedirectMiddleware)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(workorder_router)
app.include_router(inventory_router)
app.include_router(financial_router)


@app.get("/debug-auth")
async def debug_auth(request: Request):
    """Debug endpoint to check received cookies and headers."""
    return {
        "cookies": request.cookies,
        "headers": {
            k: v
            for k, v in request.headers.items()
            if k.lower() in ["authorization", "cookie"]
        },
        "remote_addr": request.client.host,
    }


@app.get("/analytics/oee")
async def get_oee_metrics(
    device_id: Optional[str] = None,
    user=lead_above,
    service=Depends(get_reporting_service),
):
    """Retrieves Overall Equipment Effectiveness (OEE) metrics.

    Args:
        device_id: Optional device ID to filter by.
        user: The authenticated user (lead or above).
        service: The reporting service instance.

    Returns:
        OEEMetricsResponse: The OEE metrics.
    """
    return service.get_oee_metrics(device_id)


@app.get("/health")
async def health_check(pool=Depends(get_db_pool)):
    """Health check endpoint for load balancers.

    Args:
        pool: Database connection pool dependency.

    Returns:
        dict: A dictionary containing the health status of various services.

    Raises:
        HTTPException: If any of the services are unhealthy.
    """
    from .ingestion.influx_client import client as influx_client

    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {"postgres": "unknown", "influxdb": "unknown"},
    }

    # Check Postgres (asyncpg)
    try:
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
            health_status["services"]["postgres"] = "healthy"
    except Exception as e:
        logger.error(f"Postgres health check failed: {e}")
        health_status["services"]["postgres"] = "unhealthy"
        health_status["status"] = "degraded"

    # Check InfluxDB
    try:
        if influx_client.ready().status == "ready":
            health_status["services"]["influxdb"] = "healthy"
        else:
            health_status["services"]["influxdb"] = "unhealthy"
            health_status["status"] = "degraded"
    except Exception as e:
        logger.error(f"InfluxDB health check failed: {e}")
        health_status["services"]["influxdb"] = "unhealthy"
        health_status["status"] = "degraded"

    if health_status["status"] == "degraded":
        raise HTTPException(status_code=503, detail=health_status)

    return health_status


async def log_audit_action(
    pool, user_id: str, action: str, resource: str, details: str = None
):
    """Logs a user action to the audit log table with basic redaction.

    Args:
        pool: Database connection pool.
        user_id: The ID of the user performing the action.
        action: The action performed (e.g., 'SUBMIT_FEEDBACK').
        resource: The resource affected by the action (e.g., 'anomaly:123').
        details: Optional additional details about the action.
    """
    if details:
        sensitive_keywords = ["password", "token", "secret", "key"]
        for kw in sensitive_keywords:
            if kw in details.lower():
                details = "[REDACTED]"
                break

    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO "audit_log" ("userId", "action", "resource", "details") VALUES ($1, $2, $3, $4)',
            user_id,
            action,
            resource,
            details,
        )


@app.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    device_id: str = None,
    user=lead_above,
    pool=Depends(get_db_pool),
):
    """API endpoint to retrieve recent audit logs."""
    if device_id:
        query = 'SELECT * FROM "audit_log" WHERE "resource" LIKE $1 ORDER BY "timestamp" DESC LIMIT $2 OFFSET $3'
        params = [f"%{device_id}%", limit, offset]
    else:
        query = 'SELECT * FROM "audit_log" ORDER BY "timestamp" DESC LIMIT $1 OFFSET $2'
        params = [limit, offset]

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@app.get("/users")
async def get_users(user=admin_only, pool=Depends(get_db_pool)):
    """Retrieves a list of all users.

    Requires ADMIN role.
    """
    query = """
        SELECT
            u.id,
            u.name,
            u.email,
            u.role,
            u.image,
            (SELECT MAX("expiresAt") FROM session WHERE "userId" = u.id) as "lastActive"
        FROM "user" u
        ORDER BY u.name
    """
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
        # Manually determine status based on lastActive
        users = []
        for row in rows:
            user_dict = dict(row)
            last_active = user_dict.get("lastActive")
            status = "INACTIVE"
            if last_active and last_active > datetime.now(timezone.utc) - timedelta(days=30):
                status = "ACTIVE"
            user_dict["status"] = status
            users.append(user_dict)
        return users




@app.post("/analytics/feedback")
async def submit_feedback(
    data: dict, user=authenticated_user, pool=Depends(get_db_pool)
):
    """Receives human feedback (True/False) for an anomaly prediction.

    Args:
        data: A dictionary containing feedback details (anomalyId, deviceId, isReal).
        user: The authenticated user submitting feedback.
        pool: Database connection pool dependency.

    Returns:
        dict: A status message indicating success.

    Raises:
        HTTPException: If required fields are missing from the data.
    """
    anomaly_id = data.get("anomalyId")
    device_id = data.get("deviceId")
    is_real = data.get("isReal")

    if not all([anomaly_id, device_id]) or is_real is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO "model_feedback" ("anomalyId", "deviceId", "isReal", "userId") VALUES ($1, $2, $3, $4)',
            anomaly_id,
            device_id,
            is_real,
            user["id"],
        )
        await log_audit_action(
            pool,
            user["id"],
            "SUBMIT_FEEDBACK",
            f"anomaly:{anomaly_id}",
            f"is_real:{is_real}",
        )

    return {"status": "success"}


@app.get("/analytics/metrics")
async def get_model_metrics(user=lead_above, pool=Depends(get_db_pool)):
    """Calculates ML model performance metrics based on user feedback and actual events.

    Args:
        user: The authenticated user (lead or above).
        pool: Database connection pool dependency.

    Returns:
        dict: A dictionary containing precision, recall, F1 score, and other metrics.
    """
    from .ingestion.influx_client import get_total_telemetry_count
    from .work_orders.database import SessionLocal
    from .work_orders.models import Audit

    async with pool.acquire() as conn:
        true_positives = await conn.fetchval(
            'SELECT COUNT(*) FROM "model_feedback" WHERE "isReal" = true'
        )
        false_positives = await conn.fetchval(
            'SELECT COUNT(*) FROM "model_feedback" WHERE "isReal" = false'
        )

        # Calculate True Negatives (Approximation: Total Telemetry - Anomalies)
        # For a high-frequency system, this will be a large number
        total_points = get_total_telemetry_count("-30d")
        # In a real app, we'd subtract total detected anomalies from total points
        # For now, we use the points as a proxy for 'successful normal operation'
        true_negatives = max(0, total_points - (true_positives + false_positives))

        # Calculate False Negatives (Missed detections)
        # Approximation: Count manual work orders (those not starting with AUTO-GENERATED)
        db = SessionLocal()
        try:
            false_negatives = (
                db.query(Audit).filter(~Audit.remarks.like("AUTO-GENERATED%")).count()
            )
        except Exception:
            false_negatives = 0
        finally:
            db.close()

        precision = (
            true_positives / (true_positives + false_positives)
            if (true_positives + false_positives) > 0
            else 0
        )
        recall = (
            true_positives / (true_positives + false_negatives)
            if (true_positives + false_negatives) > 0
            else 0
        )

        total_predictions = (
            true_positives + false_positives + true_negatives + false_negatives
        )
        accuracy = (
            (true_positives + true_negatives) / total_predictions
            if total_predictions > 0
            else 0
        )
        fdr = (
            false_positives / (true_positives + false_positives)
            if (true_positives + false_positives) > 0
            else 0
        )

        return {
            "precision": round(precision, 2),
            "recall": round(recall, 2),
            "f1Score": round(2 * (precision * recall) / (precision + recall), 2)
            if (precision + recall) > 0
            else 0,
            "accuracy": round(accuracy * 100, 1),
            "fdr": round(fdr * 100, 1),
            "truePositives": true_positives,
            "falsePositives": false_positives,
            "trueNegatives": true_negatives,
            "falseNegatives": false_negatives,
            "period": "Last 30 Days",
        }


@app.get("/assets")
async def get_assets(limit: int = 100, offset: int = 0, user=authenticated_user):
    """Retrieves all assets with their health status from InfluxDB.

    Uses optimized queries.

    Args:
        limit: Maximum number of assets to retrieve. Defaults to 100.
        offset: Number of assets to skip. Defaults to 0.
        user: The authenticated user.

    Returns:
        list: A list of assets with their current status and last update time.
    """
    from .ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api

    # Note: unique() or group() in Flux can be used for true pagination if device count is huge
    # For now, we optimize by using a single query and limiting the processing

    telemetry_query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "machine_telemetry") |> group(columns: ["device_id"]) |> last() |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")'
    telemetry_tables = query_api.query(telemetry_query, org=INFLUX_ORG)

    risk_query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "predictive_results") |> group(columns: ["device_id"]) |> last()'
    risk_tables = query_api.query(risk_query, org=INFLUX_ORG)

    risk_map = {}
    for table in risk_tables:
        for record in table.records:
            if record.get_field() == "risk_level":
                risk_map[record.values.get("device_id")] = record.get_value()

    # Use a set to track unique device IDs and prevent duplicates
    seen_devices = set()
    all_assets = []
    for table in telemetry_tables:
        for record in table.records:
            d_id = record.values.get("device_id")

            if d_id in seen_devices:
                continue
            seen_devices.add(d_id)
            risk = risk_map.get(d_id, "Normal")

            status = "GREEN"
            if risk == "High-Risk":
                status = "RED"
            elif risk == "Warning":
                status = "YELLOW"

            all_assets.append(
                {
                    "id": d_id,
                    "name": d_id.replace("_", " ").title(),
                    "status": status,
                    "lastUpdated": record.get_time().isoformat(),
                    "type": record.values.get("type", "Machine"),
                    "location": "Plant Floor A",
                    "rms": float(record.values.get("vibration_rms", 0.0)),
                    "rul": float(record.values.get("vibration", 0.0))
                    / 20.0,  # Placeholder calculation
                }
            )
    return all_assets[offset : offset + limit]


@app.get("/assets/{asset_id}/telemetry")
async def get_asset_telemetry(
    asset_id: str, range: str = "-1h", user=authenticated_user
):
    """Retrieves historical telemetry for a specific asset.

    Args:
        asset_id: The ID of the asset.
        range: Time range for the data. Defaults to "-1h".
        user: The authenticated user.

    Returns:
        list: A list of telemetry data points.
    """
    from .ingestion.influx_client import (
        INFLUX_BUCKET,
        INFLUX_ORG,
        query_historical_data,
    )

    tables = query_historical_data(asset_id, "machine_telemetry", range)
    results = []
    for table in tables:
        for record in table.records:
            results.append(
                {
                    "_time": record.get_time().isoformat(),
                    "temperature": record.values.get("temperature"),
                    "vibration": record.values.get("vibration"),
                    "pressure": record.values.get("pressure"),
                    "torque": record.values.get("torque"),
                    "vibration_rms": record.values.get("vibration_rms"),
                }
            )
    return results


@app.get("/assets/{asset_id}/predictions")
async def get_asset_predictions(
    asset_id: str, range: str = "-24h", user=authenticated_user
):
    """Retrieves historical RUL predictions for a specific asset.

    Args:
        asset_id: The ID of the asset.
        range: Time range for the predictions. Defaults to "-24h".
        user: The authenticated user.

    Returns:
        list: A list of predictive results.
    """
    from .ingestion.influx_client import (
        INFLUX_BUCKET,
        INFLUX_ORG,
        query_historical_data,
    )

    tables = query_historical_data(asset_id, "predictive_results", range)
    results = []
    for table in tables:
        for record in table.records:
            results.append(
                {
                    "_time": record.get_time().isoformat(),
                    "predicted_rul_hours": record.values.get("predicted_rul_hours"),
                    "predicted_fault_type": record.values.get("predicted_fault_type"),
                    "confidence_score_percent": record.values.get(
                        "confidence_score_percent"
                    ),
                    "risk_level": record.values.get("risk_level"),
                }
            )
    return results


@app.get("/anomalies")
async def get_anomalies(limit: int = 100, offset: int = 0, user=authenticated_user):
    """Retrieves detected anomalies from InfluxDB.

    Supports pagination.

    Args:
        limit: Maximum number of anomalies to retrieve. Defaults to 100.
        offset: Number of anomalies to skip. Defaults to 0.
        user: The authenticated user.

    Returns:
        list: A list of detected anomalies.
    """
    from .ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api

    # Use limit and offset directly in Flux for better performance
    # Extended to 7 days to capture more historical anomaly data
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -7d) |> filter(fn: (r) => r["_measurement"] == "anomaly_results") |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value") |> sort(columns: ["_time"], desc: true) |> limit(n: {limit}, offset: {offset})'

    tables = query_api.query(query, org=INFLUX_ORG)
    results = []

    for table in tables:
        for record in table.records:
            d_id = record.values.get("device_id")
            results.append(
                {
                    "id": f"{record.get_time().timestamp()}-{d_id}",
                    "assetId": d_id,
                    "assetName": d_id.replace("_", " ").title(),
                    "severity": record.values.get("severity", "LOW"),
                    "message": record.values.get("reason", "No reason provided"),
                    "timestamp": record.get_time().isoformat(),
                }
            )

    return results


# Alias for /alerts
@app.get("/alerts")
async def get_alerts_alias(limit: int = 100, offset: int = 0, user=authenticated_user):
    """Alias for /anomalies to support the frontend's expected endpoint."""
    return await get_anomalies(limit, offset, user)


@app.get("/safety-alerts")
@limiter.limit("30/minute")
async def get_safety_alerts(
    request: Request,
    limit: int = 100,
    offset: int = 0,
    range: str = "-24h",
    user=lead_above,
):
    """Retrieves all safety alerts within a time range.

    Supports pagination.

    Args:
        request: The FastAPI request object.
        limit: Maximum number of alerts to retrieve. Defaults to 100.
        offset: Number of alerts to skip. Defaults to 0.
        range: The time range for alerts. Defaults to "-24h".
        user: The authenticated user (lead or above).

    Returns:
        list: A list of safety alerts.
    """
    from .ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api

    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: {range}) |> filter(fn: (r) => r["_measurement"] == "safety_alerts") |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value") |> sort(columns: ["_time"], desc: true) |> limit(n: {limit}, offset: {offset})'

    tables = query_api.query(query, org=INFLUX_ORG)
    results = []

    for table in tables:
        for record in table.records:
            results.append(
                {
                    "id": f"safety-{record.get_time().timestamp()}",
                    "assetId": record.values.get("device_id"),
                    "assetName": " ".join(
                        [
                            s.capitalize()
                            for s in record.values.get("device_id").split("_")
                        ]
                    ),
                    "severity": "CRITICAL",
                    "type": record.values.get("type"),
                    "currentTemp": record.values.get("temperature"),
                    "baselineTemp": 60.0,
                    "timestamp": record.get_time().isoformat(),
                    "acknowledged": False,
                }
            )

    return results


@app.post("/ingest/dev")
@limiter.limit("10/minute")
async def ingest_data_dev(request: Request, data: dict, user=admin_only):
    """Authenticated ingestion endpoint for development and testing.

    Args:
        request: The FastAPI request object.
        data: A dictionary containing telemetry data.
        user: The authenticated admin user.

    Returns:
        dict: The ingestion processing result.

    Raises:
        HTTPException: If device_id is missing or processing fails.
    """
    from .ingestion.core import process_ingestion

    device_id = data.get("device_id")
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id is required")

    result = process_ingestion(device_id, data)

    if not result:
        raise HTTPException(status_code=500, detail="Ingestion processing failed")

    return {**result, "status": "success", "user": "dev_user"}


@app.get("/heartbeats")
@limiter.limit("60/minute")
async def get_heartbeats(
    request: Request, limit: int = 100, offset: int = 0, user=lead_above
):
    """Retrieves the last seen status for all devices from InfluxDB.

    Supports pagination.

    Args:
        request: The FastAPI request object.
        limit: Maximum number of heartbeats to retrieve. Defaults to 100.
        offset: Number of heartbeats to skip. Defaults to 0.
        user: The authenticated user (lead or above).

    Returns:
        list: A list of device heartbeat statuses.
    """
    from .ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api

    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: -30d) |> filter(fn: (r) => r["_measurement"] == "machine_telemetry") |> group(columns: ["device_id"]) |> last()'
    tables = query_api.query(query, org=INFLUX_ORG)

    results = []
    seen_devices = set()
    for table in tables:
        for record in table.records:
            device_id = record.values.get("device_id")

            if device_id in seen_devices:
                continue
            seen_devices.add(device_id)
            last_seen = record.get_time()

            now = datetime.now(timezone.utc)
            ls = (
                last_seen.replace(tzinfo=timezone.utc)
                if last_seen.tzinfo is None
                else last_seen
            )
            diff = (now - ls).total_seconds()

            status = "Active" if diff <= 65 else "Inactive"

            results.append(
                {
                    "deviceId": device_id,
                    "lastSeen": last_seen.isoformat(),
                    "status": status,
                    "secondsSinceLast": int(diff),
                }
            )
    return results
