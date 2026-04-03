from fastapi import FastAPI, Request, HTTPException, Depends
from typing import Optional
import asyncpg
import os
from dotenv import load_dotenv

# Import routers from other modules
from precognito.work_orders.api import router as workorder_router
from precognito.inventory.api import router as inventory_router

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://precognito_user:precognito_password@localhost:5432/precognito")

app = FastAPI()

# Include Routers
# Module 4: Work Orders (Protected by session)
app.include_router(workorder_router)
# Module 3: Inventory & Supply Chain
app.include_router(inventory_router)

async def get_db_pool():
    if not hasattr(app, "db_pool"):
        app.db_pool = await asyncpg.create_pool(DATABASE_URL)
    return app.db_pool

async def get_current_user(request: Request, pool = Depends(get_db_pool)):
    session_token = request.cookies.get("better-auth.session_token")
    if not session_token:
        # Check Authorization header too
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
            
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    async with pool.acquire() as conn:
        # Better Auth stores sessions in 'session' table
        session = await conn.fetchrow(
            'SELECT "userId", "expiresAt" FROM "session" WHERE "token" = $1',
            session_token
        )
        
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
            
        # Check expiry (asyncpg returns datetime)
        from datetime import datetime, timezone
        if session["expiresAt"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
            
        user = await conn.fetchrow(
            'SELECT * FROM "user" WHERE "id" = $1',
            session["userId"]
        )
        return user

async def log_audit_action(pool, user_id: str, action: str, resource: str, details: str = None):
    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO "audit_log" ("userId", "action", "resource", "details") VALUES ($1, $2, $3, $4)',
            user_id, action, resource, details
        )

@app.get("/audit-logs")
async def get_audit_logs(user = Depends(get_current_user), pool = Depends(get_db_pool)):
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            'SELECT a.*, u.name as "userName" FROM "audit_log" a JOIN "user" u ON a."userId" = u.id ORDER BY a.timestamp DESC LIMIT 100'
        )
        return [dict(r) for r in rows]

@app.post("/model-feedback")
async def submit_model_feedback(data: dict, user = Depends(get_current_user), pool = Depends(get_db_pool)):
    anomaly_id = data.get("anomalyId")
    device_id = data.get("deviceId")
    is_real = data.get("isReal")

    if not all([anomaly_id, device_id]) or is_real is None:
        raise HTTPException(status_code=400, detail="Missing required fields")

    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO "model_feedback" ("anomalyId", "deviceId", "isReal", "userId") VALUES ($1, $2, $3, $4)',
            anomaly_id, device_id, is_real, user["id"]
        )
        await log_audit_action(pool, user["id"], "SUBMIT_FEEDBACK", f"anomaly:{anomaly_id}", f"is_real:{is_real}")

    return {"status": "success"}

@app.get("/analytics/metrics")
async def get_model_metrics(user = Depends(get_current_user), pool = Depends(get_db_pool)):
    async with pool.acquire() as conn:
        # Calculate metrics from feedback
        total_feedback = await conn.fetchval('SELECT COUNT(*) FROM "model_feedback"')
        true_positives = await conn.fetchval('SELECT COUNT(*) FROM "model_feedback" WHERE "isReal" = true')
        false_positives = await conn.fetchval('SELECT COUNT(*) FROM "model_feedback" WHERE "isReal" = false')

        # Mock some negatives since we don't have user feedback for non-anomalies usually
        true_negatives = 1000 # Mocked for prototype
        false_negatives = 2 # Mocked for prototype

        total = true_positives + false_positives + true_negatives + false_negatives
        accuracy = (true_positives + true_negatives) / total if total > 0 else 0.95
        fdr = false_positives / (true_positives + false_positives) * 100 if (true_positives + false_positives) > 0 else 2.5

        return {
            "accuracy": round(accuracy * 100, 1),
            "fdr": round(fdr, 1),
            "truePositives": true_positives,
            "falsePositives": false_positives,
            "trueNegatives": true_negatives,
            "falseNegatives": false_negatives,
            "period": "30 days"
        }

@app.get("/analytics/oee")
async def get_oee_metrics(device_id: Optional[str] = None, user = Depends(get_current_user)):
    # Simple OEE calculation for prototype
    # In production, this would query historical data over shifts
    return {
        "availability": 98.5,
        "performance": 94.2,
        "quality": 99.1,
        "oee": 91.8,
        "downtimeAvoidedHours": 124,
        "costSavings": 45000
    }

@app.get("/")
def home():
    return {"message": "Precognito Backend Running"}

@app.post("/ingest")
async def ingest_data(data: dict, user = Depends(get_current_user)):
    from precognito.ingestion.core import process_ingestion

    device_id = data.get("device_id")
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id is required")

    result = process_ingestion(device_id, data)
    
    if not result:
        raise HTTPException(status_code=500, detail="Ingestion processing failed")

    return {
        **result,
        "status": "success",
        "user": user["name"]
    }

@app.get("/assets")
async def get_assets(user = Depends(get_current_user)):
    from precognito.ingestion.influx_client import get_all_devices, query_latest_data
    
    device_ids = get_all_devices()
    assets = []
    
    for d_id in device_ids:
        # Get latest telemetry
        tel_tables = query_latest_data(d_id, "machine_telemetry")
        # Get latest prediction
        pred_tables = query_latest_data(d_id, "predictive_results")
        
        asset_info = {
            "id": d_id,
            "name": d_id.replace("_", " ").title(),
            "status": "GREEN", # Default
            "rms": 0.0,
            "rul": 0.0,
            "lastUpdated": None
        }
        
        if tel_tables:
            for table in tel_tables:
                for record in table.records:
                    if record.get_field() == "vibration_rms":
                        asset_info["rms"] = record.get_value()
                    asset_info["lastUpdated"] = record.get_time().isoformat()
        
        if pred_tables:
            for table in pred_tables:
                for record in table.records:
                    if record.get_field() == "predicted_rul_hours":
                        asset_info["rul"] = record.get_value()
                    if record.get_field() == "risk_level":
                        risk = record.get_value()
                        if risk == "High-Risk": asset_info["status"] = "RED"
                        elif risk == "Warning": asset_info["status"] = "YELLOW"
        
        assets.append(asset_info)
        
    return assets

@app.get("/assets/{device_id}/telemetry")
async def get_asset_telemetry(device_id: str, range: str = "-24h", user = Depends(get_current_user)):
    from precognito.ingestion.influx_client import query_historical_data
    
    tables = query_historical_data(device_id, "machine_telemetry", range)
    results = []
    
    for table in tables:
        for record in table.records:
            results.append(record.values)
            
    return results

@app.get("/assets/{device_id}/predictions")
async def get_asset_predictions(device_id: str, range: str = "-24h", user = Depends(get_current_user)):
    from precognito.ingestion.influx_client import query_historical_data
    
    tables = query_historical_data(device_id, "predictive_results", range)
    results = []
    
    for table in tables:
        for record in table.records:
            results.append(record.values)
            
    return results

@app.get("/alerts")
async def get_all_alerts(range: str = "-24h", user = Depends(get_current_user)):
    from precognito.ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api
    
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: {range}) |> filter(fn: (r) => r["_measurement"] == "anomaly_results") |> filter(fn: (r) => r["_field"] == "anomaly_detected") |> filter(fn: (r) => r["_value"] == true) |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")'
    
    tables = query_api.query(query, org=INFLUX_ORG)
    results = []
    
    for table in tables:
        for record in table.records:
            results.append({
                "id": f"{record.get_time().timestamp()}-{record.values.get('device_id')}",
                "deviceId": record.values.get("device_id"),
                "severity": record.values.get("severity"),
                "message": record.values.get("reason"),
                "timestamp": record.get_time().isoformat(),
                "acknowledged": False
            })
            
    # Sort by timestamp descending
    results.sort(key=lambda x: x["timestamp"], reverse=True)
    return results

@app.get("/safety-alerts")
async def get_safety_alerts(range: str = "-24h", user = Depends(get_current_user)):
    from precognito.ingestion.influx_client import INFLUX_BUCKET, INFLUX_ORG, query_api
    
    query = f'from(bucket: "{INFLUX_BUCKET}") |> range(start: {range}) |> filter(fn: (r) => r["_measurement"] == "safety_alerts") |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")'
    
    tables = query_api.query(query, org=INFLUX_ORG)
    results = []
    
    for table in tables:
        for record in table.records:
            results.append({
                "id": f"safety-{record.get_time().timestamp()}",
                "assetId": record.values.get("device_id"),
                "assetName": record.values.get("device_id").replace("_", " ").title(),
                "severity": "CRITICAL",
                "type": record.values.get("type"),
                "currentTemp": record.values.get("temperature"),
                "baselineTemp": 60.0,
                "timestamp": record.get_time().isoformat(),
                "acknowledged": False
            })
            
    return results

@app.post("/ingest/dev")
async def ingest_data_dev(data: dict):
    """Unauthenticated ingestion for development/testing"""
    from precognito.ingestion.core import process_ingestion

    device_id = data.get("device_id")
    if not device_id:
        raise HTTPException(status_code=400, detail="device_id is required")

    result = process_ingestion(device_id, data)
    
    if not result:
        raise HTTPException(status_code=500, detail="Ingestion processing failed")

    return {
        **result,
        "status": "success",
        "user": "dev_user"
    }

@app.get("/heartbeats")
async def get_heartbeats():
    from precognito.ingestion.heartbeat import device_status
    from datetime import datetime
    
    results = []
    for device_id, last_seen in device_status.items():
        diff = (datetime.now() - last_seen).seconds
        status = "Active" if diff <= 5 else "Inactive"
        results.append({
            "deviceId": device_id,
            "lastSeen": last_seen.isoformat(),
            "status": status,
            "secondsSinceLast": diff
        })
    return results

@app.on_event("startup")
async def startup():
    await get_db_pool()

@app.on_event("shutdown")
async def shutdown():
    if hasattr(app, "db_pool"):
        await app.db_pool.close()
