from fastapi import FastAPI
from precognito.ingestion.preprocess import preprocess
from precognito.ingestion.heartbeat import update_heartbeat, check_device_status
from precognito.ingestion.alerts import check_alerts

app = FastAPI()


@app.get("/")
def home():
    return {"message": "Precognito Backend Running"}

@app.post("/ingest")
def ingest_data(data: dict):
    processed = preprocess(data)

    device_id = data.get("device_id")

    update_heartbeat(device_id)
    status = check_device_status(device_id)

    alert = check_alerts(processed)

    return {
        "processed_data": processed,
        "device_status": status,
        "alert": alert
    }