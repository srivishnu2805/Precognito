# Anomaly Detection Test Suite

This folder contains comprehensive test cases for the ML-based anomaly detection module.

## 📁 Test Structure

```
test_anomaly/
├── README.md                    # This file
├── unit_tests.py               # Core logic unit tests
├── integration_tests.py         # API endpoint integration tests
├── performance_tests.py         # Performance and load tests
├── test_data/                 # Test datasets
│   ├── normal_cases.json      # Normal operation cases
│   ├── anomaly_cases.json     # Clear anomaly cases
│   ├── batch_cases.json       # Batch processing cases
│   └── edge_cases.json       # Edge cases and errors
└── run_all_tests.py           # Test runner script
```

## 🧪 Test Categories

### **Unit Tests**
- Pattern detection logic
- ML model prediction
- Threshold fallback
- Result combination
- Feature mapping

### **Integration Tests**
- API endpoint functionality
- Request/response validation
- Error handling
- Batch processing

### **Performance Tests**
- Response time benchmarks
- Memory usage validation
- Concurrent request handling
- Large batch processing

### **Test Data**
- **Normal Cases**: Expected non-anomalous readings
- **Anomaly Cases**: Clear anomalous patterns
- **Batch Cases**: Mixed data scenarios
- **Edge Cases**: Invalid inputs, extreme values

## 🚀 Running Tests

### **Run All Tests**
```bash
cd test_anomaly
python run_all_tests.py
```

### **Run Specific Test Type**
```bash
# Unit tests only
python unit_tests.py

# Integration tests only
python integration_tests.py

# Performance tests only
python performance_tests.py
```

## 📊 Expected Results

### **Normal Test Cases**
- `anomaly_detected: false`
- `severity: LOW`
- `confidence: < 0.2`
- `anomaly_types: []`

### **Anomaly Test Cases**
- `anomaly_detected: true`
- `severity: MODERATE/HIGH`
- `confidence: > 0.5`
- `anomaly_types: ["ML_Detected"]`

### **Batch Test Cases**
- Mixed results based on data
- Sequential processing maintained
- Pattern detection working
- ML model predictions accurate

## 🔧 Configuration

Test configuration can be modified in:
- `test_config.json`: Test settings
- Individual test files: Specific parameters

## 📈 Coverage Metrics

- **Code Coverage**: >90%
- **Test Coverage**: All API endpoints
- **Edge Cases**: All error scenarios
- **Performance**: <100ms response time

---

**Last Updated**: April 2026  
**Test Suite Version**: 1.0
