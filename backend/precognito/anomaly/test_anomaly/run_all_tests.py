#!/usr/bin/env python3
"""
Comprehensive test runner for anomaly detection module

This script runs all test categories and generates a comprehensive report.
"""

import json
import time
import requests
from pathlib import Path
import sys
import os

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent.parent))

from core import detect_anomaly, get_detector

class TestRunner:
    def __init__(self, base_url="http://127.0.0.1:8000"):
        self.base_url = base_url
        self.results = {
            "unit_tests": {"passed": 0, "failed": 0, "errors": []},
            "integration_tests": {"passed": 0, "failed": 0, "errors": []},
            "performance_tests": {"passed": 0, "failed": 0, "errors": []},
            "summary": {"total_tests": 0, "overall_passed": False}
        }
    
    def run_test_case(self, test_case, test_type):
        """Run a single test case and validate results"""
        try:
            if test_type == "batch":
                response = requests.post(
                    f"{self.base_url}/anomaly/detect/batch",
                    json=test_case["input"],
                    timeout=30
                )
            else:
                response = requests.post(
                    f"{self.base_url}/anomaly/detect",
                    json=test_case["input"],
                    timeout=30
                )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list):
                    # Batch response
                    passed = self._validate_batch_result(result, test_case["expected"])
                else:
                    # Single response
                    passed = self._validate_single_result(result, test_case["expected"])
                
                if passed:
                    self.results[test_type]["passed"] += 1
                else:
                    self.results[test_type]["failed"] += 1
                    self.results[test_type]["errors"].append({
                        "test": test_case["name"],
                        "expected": test_case["expected"],
                        "actual": result
                    })
            else:
                self.results[test_type]["failed"] += 1
                self.results[test_type]["errors"].append({
                    "test": test_case["name"],
                    "error": f"HTTP {response.status_code}",
                    "response": response.text
                })
                
        except Exception as e:
            self.results[test_type]["failed"] += 1
            self.results[test_type]["errors"].append({
                "test": test_case["name"],
                "error": str(e)
            })
    
    def _validate_single_result(self, result, expected):
        """Validate single detection result"""
        if expected.get("status_code"):
            return result.get("error") is not None
        
        anomaly_detected = result.get("anomaly_detected", False)
        expected_anomaly = expected.get("anomaly_detected", False)
        
        if anomaly_detected != expected_anomaly:
            return False
        
        if expected.get("confidence_min"):
            if result.get("confidence", 0) < expected["confidence_min"]:
                return False
        
        if expected.get("confidence_max"):
            if result.get("confidence", 0) > expected["confidence_max"]:
                return False
        
        return True
    
    def _validate_batch_result(self, results, expected):
        """Validate batch detection results"""
        if len(results) != expected.get("total_items", 0):
            return False
        
        anomalies_detected = sum(1 for r in results if r.get("anomaly_detected", False))
        expected_anomalies = expected.get("anomalies_detected", 0)
        
        if anomalies_detected != expected_anomalies:
            return False
        
        return True
    
    def load_test_data(self, file_path):
        """Load test data from JSON file"""
        with open(file_path, 'r') as f:
            return json.load(f)
    
    def run_unit_tests(self):
        """Run unit tests on core logic"""
        print("🧪 Running Unit Tests...")
        
        # Test core functionality directly
        test_cases = [
            {
                "name": "ML Model Loading",
                "test": lambda: self._test_ml_model_loading(),
                "expected": "model_loaded"
            },
            {
                "name": "Pattern Detection",
                "test": lambda: self._test_pattern_detection(),
                "expected": "pattern_working"
            }
        ]
        
        for test_case in test_cases:
            try:
                result = test_case["test"]()
                if result == test_case["expected"]:
                    self.results["unit_tests"]["passed"] += 1
                    print(f"  ✅ {test_case['name']}")
                else:
                    self.results["unit_tests"]["failed"] += 1
                    self.results["unit_tests"]["errors"].append({
                        "test": test_case["name"],
                        "expected": test_case["expected"],
                        "actual": result
                    })
                    print(f"  ❌ {test_case['name']}")
            except Exception as e:
                self.results["unit_tests"]["failed"] += 1
                self.results["unit_tests"]["errors"].append({
                    "test": test_case["name"],
                    "error": str(e)
                })
                print(f"  💥 {test_case['name']}: {e}")
    
    def _test_ml_model_loading(self):
        """Test if ML model loads correctly"""
        try:
            detector = get_detector()
            return "model_loaded" if detector.initialized else "model_not_loaded"
        except Exception:
            return "model_error"
    
    def _test_pattern_detection(self):
        """Test pattern detection logic"""
        try:
            detector = get_detector()
            # Test pattern detection with known data
            result = detector.pattern_detector.detect_spike("TEST", "temperature", 300.0)
            return "pattern_working" if result[0] is False else "pattern_error"
        except Exception:
            return "pattern_error"
    
    def run_integration_tests(self):
        """Run API integration tests"""
        print("🔗 Running Integration Tests...")
        
        # Load test data
        normal_cases = self.load_test_data("test_data/normal_cases.json")
        anomaly_cases = self.load_test_data("test_data/anomaly_cases.json")
        batch_cases = self.load_test_data("test_data/batch_cases.json")
        
        all_cases = (
            normal_cases["test_cases"] + 
            anomaly_cases["test_cases"] + 
            batch_cases["test_cases"]
        )
        
        for test_case in all_cases:
            test_type = "batch" if "data" in test_case["input"] else "integration"
            self.run_test_case(test_case, test_type)
            
            # Add delay to avoid overwhelming the server
            time.sleep(0.1)
    
    def run_performance_tests(self):
        """Run performance and load tests"""
        print("⚡ Running Performance Tests...")
        
        # Test response time
        start_time = time.time()
        test_data = {
            "machine_id": "PERF-TEST",
            "temperature": 300.0,
            "vibration": 1500.0,
            "torque": 40.0,
            "type": "M"
        }
        
        response = requests.post(
            f"{self.base_url}/anomaly/detect",
            json=test_data,
            timeout=30
        )
        
        response_time = (time.time() - start_time) * 1000
        
        if response.status_code == 200 and response_time < 500:
            self.results["performance_tests"]["passed"] += 1
            print(f"  ✅ Response Time: {response_time:.1f}ms")
        else:
            self.results["performance_tests"]["failed"] += 1
            self.results["performance_tests"]["errors"].append({
                "test": "Response Time",
                "response_time": response_time,
                "status_code": response.status_code
            })
            print(f"  ❌ Response Time: {response_time:.1f}ms")
    
    def generate_report(self):
        """Generate comprehensive test report"""
        total_tests = (
            self.results["unit_tests"]["passed"] + self.results["unit_tests"]["failed"] +
            self.results["integration_tests"]["passed"] + self.results["integration_tests"]["failed"] +
            self.results["performance_tests"]["passed"] + self.results["performance_tests"]["failed"]
        )
        
        total_passed = (
            self.results["unit_tests"]["passed"] +
            self.results["integration_tests"]["passed"] +
            self.results["performance_tests"]["passed"]
        )
        
        self.results["summary"]["total_tests"] = total_tests
        self.results["summary"]["overall_passed"] = total_passed == total_tests
        
        print("\n" + "="*60)
        print("📊 TEST REPORT")
        print("="*60)
        
        print(f"\n📈 SUMMARY:")
        print(f"  Total Tests: {total_tests}")
        print(f"  Passed: {total_passed}")
        print(f"  Failed: {total_tests - total_passed}")
        print(f"  Success Rate: {(total_passed/total_tests)*100:.1f}%")
        print(f"  Overall Status: {'✅ PASSED' if self.results['summary']['overall_passed'] else '❌ FAILED'}")
        
        print(f"\n🧪 UNIT TESTS:")
        print(f"  Passed: {self.results['unit_tests']['passed']}")
        print(f"  Failed: {self.results['unit_tests']['failed']}")
        if self.results["unit_tests"]["errors"]:
            print("  Errors:")
            for error in self.results["unit_tests"]["errors"]:
                print(f"    - {error}")
        
        print(f"\n🔗 INTEGRATION TESTS:")
        print(f"  Passed: {self.results['integration_tests']['passed']}")
        print(f"  Failed: {self.results['integration_tests']['failed']}")
        if self.results["integration_tests"]["errors"]:
            print("  Errors:")
            for error in self.results["integration_tests"]["errors"][:5]:  # Show first 5 errors
                print(f"    - {error}")
            if len(self.results["integration_tests"]["errors"]) > 5:
                print(f"    ... and {len(self.results['integration_tests']['errors']) - 5} more errors")
        
        print(f"\n⚡ PERFORMANCE TESTS:")
        print(f"  Passed: {self.results['performance_tests']['passed']}")
        print(f"  Failed: {self.results['performance_tests']['failed']}")
        if self.results["performance_tests"]["errors"]:
            print("  Errors:")
            for error in self.results["performance_tests"]["errors"]:
                print(f"    - {error}")
        
        print("\n" + "="*60)
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Anomaly Detection Test Suite")
        print(f"🌐 Testing API at: {self.base_url}")
        print("="*60)
        
        # Check if server is running
        try:
            response = requests.get(f"{self.base_url}/anomaly/status", timeout=5)
            if response.status_code != 200:
                print(f"❌ Server not responding at {self.base_url}")
                print("Please start the server with: python main_simple.py")
                return
        except requests.exceptions.RequestException:
            print(f"❌ Cannot connect to server at {self.base_url}")
            print("Please start the server with: python main_simple.py")
            return
        
        print("✅ Server is running - starting tests...\n")
        
        # Run all test categories
        self.run_unit_tests()
        self.run_integration_tests()
        self.run_performance_tests()
        
        # Generate final report
        self.generate_report()
        
        return self.results["summary"]["overall_passed"]

def main():
    """Main test runner"""
    # Check if we're in the right directory
    if not Path("test_data").exists():
        print("❌ Error: test_data directory not found")
        print("Please run from test_anomaly directory")
        return
    
    # Get server URL from command line args
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
    
    runner = TestRunner(base_url)
    success = runner.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
