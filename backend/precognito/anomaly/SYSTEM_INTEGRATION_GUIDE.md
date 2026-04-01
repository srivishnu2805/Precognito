# Anomaly Detection Module - System Integration Guide

## 🎯 Overview
This guide provides step-by-step instructions for integrating the ML-based anomaly detection module into the Precognito predictive maintenance system.

## 📋 Prerequisites

### **System Requirements**
- Python 3.8+
- 4GB+ RAM
- 10GB+ disk space
- Network access for sensor data
- Database access for historical data

### **Dependencies**
```bash
pip install fastapi uvicorn pandas numpy scikit-learn pickle5
```

### **Files Required**
```
anomaly/
├── core.py                    # Main detection engine ✅
├── api_simple.py              # FastAPI endpoints ✅
├── main_simple.py             # Application entry ✅
├── anomaly_model.pkl          # Trained ML model ✅
├── scaler.pkl                 # Feature scaler ✅
├── feature_names.json         # Feature metadata ✅
└── label_encoder.pkl          # Categorical encoder ✅
```

## 🚀 Integration Steps

### **Phase 1: Setup & Configuration**

#### 1.1 Environment Setup
```bash
# Navigate to anomaly module
cd backend/precognito/anomaly

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\\Scripts\\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

#### 1.2 Configuration
Create environment configuration:
```bash
# Create .env file
echo "ANOMALY_MODEL_PATH=./anomaly_model.pkl" > .env
echo "ANOMALY_SCALER_PATH=./scaler.pkl" >> .env
echo "API_HOST=0.0.0.0" >> .env
echo "API_PORT=8000" >> .env
echo "LOG_LEVEL=INFO" >> .env
```

#### 1.3 Database Integration
```python
# Example: Connect to your existing database
import sqlite3
import psycopg2  # For PostgreSQL
import pymongo    # For MongoDB

def setup_database_connection():
    # Configure based on your database
    DB_CONFIG = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'precognito'),
        'user': os.getenv('DB_USER', 'admin'),
        'password': os.getenv('DB_PASSWORD', 'password')
    }
    
    # Connect and store anomaly results
    conn = psycopg2.connect(**DB_CONFIG)
    return conn
```

### **Phase 2: Data Pipeline Integration**

#### 2.1 Real-time Sensor Data
```python
# Example: Connect to sensor data streams
import asyncio
import websockets
from core import detect_anomaly

async def sensor_data_handler(websocket, path):
    """Handle incoming sensor data"""
    async for message in websocket:
        sensor_data = json.loads(message)
        
        # Detect anomalies
        result = detect_anomaly(sensor_data)
        
        if result['anomaly_detected']:
            # Trigger alert
            await trigger_alert(result)
        
        # Store in database
        await store_anomaly_result(result)

# WebSocket endpoint for real-time data
async def main():
    server = await websockets.serve(sensor_data_handler, "localhost", 8765)
    await server
```

#### 2.2 Historical Data Integration
```python
# Example: Batch processing of historical data
import pandas as pd
from core import get_detector

def process_historical_data(csv_file_path):
    """Process historical sensor data for batch analysis"""
    df = pd.read_csv(csv_file_path)
    
    # Convert to API format
    batch_data = []
    for _, row in df.iterrows():
        batch_data.append({
            "machine_id": row['machine_id'],
            "temperature": row['temperature'],
            "vibration": row['vibration'],
            "torque": row['torque'],
            "type": row.get('type', 'M')
        })
    
    # Process batch
    detector = get_detector()
    results = detector.detect_batch(batch_data)
    
    # Store results
    store_batch_results(results)
    return results
```

### **Phase 3: Alert System Integration**

#### 3.1 Email Alerts
```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def send_email_alert(anomaly_result):
    """Send email alert for detected anomaly"""
    if anomaly_result['severity'] in ['HIGH', 'CRITICAL']:
        msg = MIMEMultipart()
        msg['From'] = 'alerts@precognito.com'
        msg['To'] = 'maintenance-team@company.com'
        msg['Subject'] = f\"🚨 ANOMALY DETECTED - {anomaly_result['machine_id']}\"
        
        body = f\"\"\"
        Machine: {anomaly_result['machine_id']}
        Timestamp: {anomaly_result['timestamp']}
        Severity: {anomaly_result['severity']}
        Confidence: {anomaly_result['confidence']:.2f}
        Reason: {anomaly_result['reason']}
        
        Details: {json.dumps(anomaly_result, indent=2)}
        \"\"\"
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login('your-email@gmail.com', 'your-password')
        server.send_message(msg)
        server.quit()
```

#### 3.2 SMS Alerts
```python
import requests

async def send_sms_alert(anomaly_result):
    """Send SMS alert for critical anomalies"""
    if anomaly_result['severity'] == 'CRITICAL':
        sms_data = {
            'to': '+1234567890',
            'message': f\"CRITICAL: {anomaly_result['machine_id']} anomaly detected\"
        }
        
        # Use SMS service (Twilio, AWS SNS, etc.)
        response = requests.post(
            'https://api.twilio.com/2010-04-01/Accounts/Messages.json',
            data=sms_data,
            headers={'Authorization': 'Bearer YOUR_TWILIO_TOKEN'}
        )
```

### **Phase 4: Dashboard Integration**

#### 4.1 Real-time Dashboard
```javascript
// Frontend integration example
const API_BASE = 'http://localhost:8000';

// Real-time anomaly updates
function fetchAnomalies() {
    fetch(`${API_BASE}/anomaly/history/all`)
        .then(response => response.json())
        .then(data => {
            updateDashboard(data);
        });
}

// Real-time monitoring
setInterval(fetchAnomalies, 5000);  // Update every 5 seconds

function updateDashboard(anomalies) {
    const anomalyCount = anomalies.filter(a => a.anomaly_detected).length;
    
    // Update UI
    document.getElementById('anomaly-count').textContent = anomalyCount;
    document.getElementById('system-status').className = 
        anomalyCount > 0 ? 'status-critical' : 'status-normal';
    
    // Update charts
    updateAnomalyChart(anomalies);
}
```

#### 4.2 Analytics Integration
```python
# Example: Analytics API endpoint
from fastapi import APIRouter
from core import get_detector

analytics_router = APIRouter(prefix="/analytics")

@analytics_router.get("/summary")
async def get_anomaly_summary():
    \"\"\"Get anomaly detection summary\"\"\"
    detector = get_detector()
    
    # Calculate metrics
    summary = {
        "total_detections": detector.total_detections,
        "accuracy": detector.accuracy,
        "false_positive_rate": detector.false_positive_rate,
        "average_response_time": detector.avg_response_time,
        "active_machines": len(detector.pattern_detector.history),
        "model_version": detector.model_version
    }
    
    return summary
```

## 🔧 Production Deployment

### **5.1 Docker Deployment**
```dockerfile
# Dockerfile for anomaly detection
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY anomaly/ ./anomaly/
COPY main_simple.py .

EXPOSE 8000

CMD ["python", "main_simple.py"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  anomaly-detection:
    build: .
    ports:
      - "8000:8000"
    environment:
      - API_HOST=0.0.0.0
      - API_PORT=8000
      - LOG_LEVEL=INFO
    volumes:
      - ./models:/app/models
      - ./logs:/app/logs
    restart: unless-stopped
```

### **5.2 Kubernetes Deployment**
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: anomaly-detection
spec:
  replicas: 3
  selector:
    matchLabels:
      app: anomaly-detection
  template:
    metadata:
      labels:
        app: anomaly-detection
    spec:
      containers:
      - name: anomaly-api
        image: precognito/anomaly-detection:latest
        ports:
        - containerPort: 8000
        env:
        - name: API_HOST
          value: "0.0.0.0"
        - name: API_PORT
          value: "8000"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

## 📊 Monitoring & Maintenance

### **6.1 Health Monitoring**
```python
# Health check endpoint
from fastapi import APIRouter

@router.get("/health")
async def health_check():
    \"\"\"Comprehensive health check\"\"\"
    try:
        detector = get_detector()
        
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "model_loaded": detector.initialized,
            "memory_usage": get_memory_usage(),
            "cpu_usage": get_cpu_usage(),
            "active_connections": get_active_connections(),
            "last_detection": detector.last_detection_time
        }
        
        return health_status
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
```

### **6.2 Performance Monitoring**
```python
# Performance metrics collection
import time
import psutil

class PerformanceMonitor:
    def __init__(self):
        self.metrics = {
            "response_times": [],
            "error_count": 0,
            "request_count": 0
        }
    
    def record_request(self, response_time, success=True):
        self.metrics["response_times"].append(response_time)
        self.metrics["request_count"] += 1
        if not success:
            self.metrics["error_count"] += 1
    
    def get_metrics(self):
        if self.metrics["response_times"]:
            avg_response_time = sum(self.metrics["response_times"]) / len(self.metrics["response_times"])
        else:
            avg_response_time = 0
        
        return {
            "avg_response_time_ms": avg_response_time * 1000,
            "error_rate": self.metrics["error_count"] / self.metrics["request_count"],
            "total_requests": self.metrics["request_count"],
            "memory_usage_mb": psutil.virtual_memory().used / 1024 / 1024,
            "cpu_usage_percent": psutil.cpu_percent()
        }
```

## 🧪 Testing Integration

### **7.1 Automated Testing**
```bash
# Run comprehensive test suite
cd test_anomaly
python run_all_tests.py http://your-production-api.com

# Test specific categories
python run_all_tests.py --unit-only
python run_all_tests.py --integration-only
python run_all_tests.py --performance-only
```

### **7.2 Load Testing**
```python
# Load testing with locust
from locust import HttpUser, task, between

class AnomalyApiUser(HttpUser):
    wait_time = between(100, 500)
    
    @task(3)
    def detect_anomaly(self):
        self.client.post("/anomaly/detect", json={
            "machine_id": "LOAD-TEST",
            "temperature": 300.0,
            "vibration": 1500.0,
            "torque": 40.0,
            "type": "M"
        })
    
    @task(1)
    def detect_batch(self):
        self.client.post("/anomaly/detect/batch", json={
            "data": [
                {"machine_id": f"LOAD-BATCH-{i}", 
                 "temperature": 300.0, 
                 "vibration": 1500.0, 
                 "torque": 40.0, 
                 "type": "M"} 
                for i in range(10)
            ]
        })

# Run load test
# locust -f load_test.py --users 50 --spawn-rate 5 --host http://your-api.com
```

## 📈 Scaling & Optimization

### **8.1 Horizontal Scaling**
- Load balancer configuration
- Multiple API instances
- Database connection pooling
- Caching layer (Redis)

### **8.2 Model Optimization**
```python
# Automated model retraining
import schedule
import joblib

def retrain_model():
    \"\"\"Retrain model with new data\"\"\"
    # Collect new training data
    new_data = collect_recent_data(days=30)
    
    # Retrain model
    from train_model import main as train_main
    train_main()
    
    # Update running model without downtime
    global detector
    new_model = joblib.load('anomaly_model.pkl')
    detector.model = new_model
    detector.scaler = joblib.load('scaler.pkl')

# Schedule retraining
schedule.every().month.do(retrain_model)
```

## 🔒 Security Considerations

### **9.1 API Security**
```python
# Add authentication to API
from fastapi import Depends, HTTPBearer
from fastapi.security import HTTPBearer

security = HTTPBearer()

@router.post("/anomaly/detect", dependencies=[Depends(security)])
async def secure_detect_anomaly(
    sensor_data: SensorData,
    credentials: HTTPBearer = Depends(security)
):
    # Verify API key or JWT token
    if not verify_api_key(credentials.credentials):
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    # Process detection
    return detect_anomaly(sensor_data.dict())
```

### **9.2 Data Protection**
```python
# Encrypt sensitive model files
from cryptography.fernet import Fernet

def encrypt_model_files():
    key = Fernet.generate_key()
    cipher = Fernet(key)
    
    # Encrypt model files
    with open('anomaly_model.pkl', 'rb') as f:
        encrypted_data = cipher.encrypt(f.read())
    
    with open('anomaly_model.enc', 'wb') as f:
        f.write(encrypted_data)
    
    # Store key securely
    with open('model_key.key', 'wb') as f:
        f.write(key)
```

## 📋 Deployment Checklist

### **Pre-deployment**
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Backup procedures documented
- [ ] Monitoring configured
- [ ] Alert systems tested

### **Post-deployment**
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Monitoring dashboards active
- [ ] Alert systems verified
- [ ] User training completed
- [ ] Documentation accessible

## 🎯 Success Metrics

### **Technical KPIs**
- API uptime: >99.5%
- Response time: <100ms (p95)
- Error rate: <0.1%
- Memory usage: <1GB
- CPU usage: <50%

### **Business KPIs**
- Anomaly detection accuracy: >95%
- False positive rate: <2%
- Mean time to detection: <5 minutes
- Maintenance cost reduction: >20%
- Equipment uptime improvement: >15%

---

## 📞 Support & Troubleshooting

### **Common Issues**
1. **Model not loading**: Check file paths and permissions
2. **High memory usage**: Reduce batch size, optimize data structures
3. **Slow response times**: Check database queries, add caching
4. **False positives**: Adjust detection thresholds, retrain with more data

### **Debug Mode**
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Add detailed logging
logger.debug(f"Processing data: {sensor_data}")
logger.debug(f"ML prediction: {prediction}")
logger.debug(f"Final result: {result}")
```

---

**Last Updated**: April 2026  
**Integration Guide Version**: 1.0  
**Compatible Module Version**: 1.0

For support and questions, contact the development team or refer to the main documentation.
