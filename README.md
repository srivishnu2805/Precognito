# Precognito

AI-powered predictive maintenance platform designed to eliminate unplanned downtime. By analyzing real-time IoT sensor telemetry and historical patterns, it identifies anomalies and predicts Remaining Useful Life (RUL) before failures occur.

## 🚀 Project Status: Production Ready Prototype

We have successfully integrated all core functional modules defined in the BRD. The system is capable of end-to-end telemetry ingestion, AI-driven analysis, and automated maintenance workflow management.

### Core Capabilities
- **Real-time Ingestion**: Supports HTTP and MQTT (Mosquitto) for industrial IoT data.
- **AI Analytics**: ML-based Anomaly Detection (Isolation Forest) and RUL Estimation (XGBoost).
- **Edge Simulation**: Local DSP logic (RMS/FFT) simulated to minimize network load.
- **Automated Workflow**: High-severity anomalies automatically trigger Work Orders in PostgreSQL.
- **JIT Inventory**: Predictive procurement alerts based on part lead times and asset RUL.
- **Integrated Notifications**: Real-time push alerts via **NTFY.sh** (SSE Integrated).
- **Advanced Dashboarding**: OEE calculation, Audit Logging, and EHS Thermal Safety monitoring.
- **PWA support**: Fully mobile-optimized with offline documentation caching.

## Project Structure

```
precognito/
├── frontend/              # Next.js 16 PWA
│   ├── src/
│   │   ├── app/          # App Router & Protected Routes
│   │   ├── components/   # Dashboard & Visualization components
│   │   └── lib/          # API client, types, constants
│   └── public/            # Service Workers & Manifest
│
├── backend/               # FastAPI Python package
│   ├── precognito/       # Integrated Core logic
│   │   ├── anomaly/     # ML Anomaly Detection Engine
│   │   ├── ingestion/    # Unified HTTP/MQTT Pipeline & DSP
│   │   ├── predictive/   # RUL Inference Engine (XGBoost)
│   │   ├── inventory/    # JIT Supply Chain Management
│   │   └── work_orders/  # Task Automation & Audit Trail
│   └── tests/            # Pytest suite (Unit & Integration)
│
├── docker-compose.yml     # PostgreSQL, InfluxDB, Mosquitto
├── BRD.md                 # Business Requirements Document
└── main.py                # Unified Process Runner (API + MQTT)
```

## Getting Started

### 1. Infrastructure (Docker)
```bash
docker compose up -d
```
Starts PostgreSQL (Relational), InfluxDB (Time-series), and Mosquitto (MQTT Broker).

### 2. Backend Setup
```bash
uv sync --all-extras
# Run unified server (API + MQTT Worker)
export PYTHONPATH=$PYTHONPATH:$(pwd)/backend
python3 main.py
```

### 3. Frontend Setup
```bash
cd frontend
bun install
bun run dev
```

### 4. Data Simulation
```bash
# Start sending simulated 1kHz telemetry via MQTT
python3 backend/precognito/ingestion/simulator.py --mode mqtt
```

## Backend Modules Status

| Module | Description | Status |
|--------|-------------|--------|
| `anomaly` | Isolation Forest detection | ✅ Integrated |
| `ingestion` | Unified Pipeline + DSP | ✅ Integrated |
| `predictive` | RUL Estimation (XGBoost) | ✅ Integrated |
| `work_orders` | Automation & QR Check-in | ✅ Integrated |
| `inventory` | JIT Procurement & Storage | ✅ Integrated |
| `financial` | ROI & Cost Estimation | 🚧 In Progress |

## Frontend Role-Based Access

| Route | Description | Access |
|-------|-------------|--------|
| `/dashboard` | Live Health Overviews | All roles |
| `/assets` | Real-time Telemetry | Maintenance & Admin |
| `/reports` | PDF/CSV Data Exports | Manager & Admin |
| `/work-orders` | QR Validation & Manuals | Technician |
| `/inventory` | Supply Chain & JIT | Store Manager |
| `/executive` | OEE & Financial ROI | Executive |
| `/settings` | NTFY Push Configuration | All roles |

## Testing

```bash
# Run all 21 backend unit tests
pytest

# Run frontend vitest
cd frontend && bun run test
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
