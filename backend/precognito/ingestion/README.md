# Module 1: IoT Sensor Data Acquisition\nResponsible: Elaina H
# Module 1: Data Ingestion, Alerts & Heartbeat Monitoring

##  Overview
This module implements the core data ingestion pipeline for the Precognito system. It handles real-time data simulation, preprocessing, alert generation, and device heartbeat monitoring.

---

##  Features Implemented

### 1. Data Ingestion
- Simulates incoming data streams using `simulator.py`
- Prepares data for further analysis (e.g., FFT)

### 2. Data Preprocessing
- Cleans and formats raw data
- Ensures consistency before analysis
- Implemented in `preprocess.py`

### 3. Real-Time Alerts
- Detects anomalies or threshold violations
- Generates alerts instantly
- Implemented in `alerts.py`

### 4. Heartbeat Monitoring
- Tracks device activity/status
- Detects inactive or failed devices
- Implemented in `heartbeat.py`

---

##  File Structure
ingestion/

│── alerts.py

│── heartbeat.py

│── preprocess.py

│── simulator.py

│── init.py

│── README.md


---

##  How It Works

1. Data is generated using the simulator  
2. Preprocessing cleans the data  
3. Alerts module checks for abnormal conditions  
4. Heartbeat module ensures devices are active  

---

##  User Stories Covered

- **US-1.1**: Data ready for FFT analysis  
- **US-1.2**: Real-time alerting system  
- **US-1.3**: Edge device heartbeat monitoring  

---

##  Testing

- API endpoints tested successfully  
- Modules verified independently  

---

##  Notes

- This module is designed to be scalable and modular  
- Can be integrated with anomaly detection models in future modules  

---

##  Author

Elaina2005
