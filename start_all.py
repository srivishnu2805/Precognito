import multiprocessing
import subprocess
import time
import sys
import os
import signal

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), "backend"))

def run_api_server():
    """Runs the FastAPI backend with auto-reloading."""
    print("🚀 Starting FastAPI Server with auto-reload...")
    env = os.environ.copy()
    env["PYTHONPATH"] = os.getcwd()
    subprocess.run(
        ["uv", "run", "uvicorn", "backend.precognito.api:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        env=env
    )

def run_mqtt_worker():
    """Runs the MQTT ingestion worker."""
    print("🐝 Starting MQTT Ingestion Worker...")
    env = os.environ.copy()
    env["PYTHONPATH"] = os.getcwd()
    subprocess.run(
        ["uv", "run", "python", "-m", "backend.precognito.ingestion.mqtt_worker"],
        env=env
    )

def run_frontend():
    """Runs the Next.js frontend."""
    print("🎨 Starting Frontend (dev:lite)...")
    os.chdir("frontend")
    subprocess.run(["bun", "run", "dev:lite"])
    os.chdir("..") # Go back to root

def run_simulator():
    """Runs the sensor telemetry simulator."""
    time.sleep(15) # Give services more time to start up, especially with reloader
    print("📡 Starting Sensor Simulator...")
    env = os.environ.copy()
    env["PYTHONPATH"] = os.getcwd()
    subprocess.run(
        ["uv", "run", "python", "backend/precognito/ingestion/simulator.py"],
        env=env
    )

def signal_handler(sig, frame):
    print("\n🛑 Stopping all services...")
    # Processes will be terminated by the multiprocessing manager
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    
    # Ensure Docker infrastructure is up
    print("🏗️ Ensuring Docker infrastructure (Postgres, InfluxDB, Mosquitto) is running...")
    subprocess.run(["docker-compose", "up", "-d", "postgres", "influxdb", "mosquitto"])

    processes = []
    
    # Define processes
    p_api = multiprocessing.Process(target=run_api_server)
    p_mqtt = multiprocessing.Process(target=run_mqtt_worker)
    p_frontend = multiprocessing.Process(target=run_frontend)
    p_simulator = multiprocessing.Process(target=run_simulator)
    
    processes.extend([p_api, p_mqtt, p_frontend, p_simulator])

    # Start all
    for p in processes:
        p.start()

    # Keep main alive
    try:
        for p in processes:
            p.join()
    except KeyboardInterrupt:
        for p in processes:
            p.terminate()
        print("👋 All services stopped.")
