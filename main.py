import multiprocessing
import uvicorn
import logging
from precognito.api import app
from precognito.ingestion.mqtt_worker import run_worker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def start_api():
    logger.info("Starting FastAPI Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

def start_mqtt_worker():
    logger.info("Starting MQTT Ingestion Worker...")
    run_worker()

if __name__ == "__main__":
    # Create processes
    api_process = multiprocessing.Process(target=start_api)
    mqtt_process = multiprocessing.Process(target=start_mqtt_worker)

    # Start processes
    api_process.start()
    mqtt_process.start()

    try:
        api_process.join()
        mqtt_process.start()
    except KeyboardInterrupt:
        logger.info("Stopping services...")
        api_process.terminate()
        mqtt_process.terminate()
