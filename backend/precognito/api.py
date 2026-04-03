from fastapi import FastAPI, Request, HTTPException, Depends
from typing import Optional
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://precognito_user:precognito_password@localhost:5432/precognito")

app = FastAPI()

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

@app.get("/")
def home():
    return {"message": "Precognito Backend Running"}

@app.post("/ingest")
async def ingest_data(data: dict, user = Depends(get_current_user)):
    from precognito.ingestion.preprocess import preprocess
    from precognito.ingestion.heartbeat import update_heartbeat, check_device_status
    from precognito.ingestion.alerts import check_alerts

    processed = preprocess(data)
    device_id = data.get("device_id")

    update_heartbeat(device_id)
    status = check_device_status(device_id)
    alert = check_alerts(processed)

    return {
        "processed_data": processed,
        "device_status": status,
        "alert": alert,
        "user": user["name"]
    }

@app.on_event("startup")
async def startup():
    await get_db_pool()

@app.on_event("shutdown")
async def shutdown():
    if hasattr(app, "db_pool"):
        await app.db_pool.close()