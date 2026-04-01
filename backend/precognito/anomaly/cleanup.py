"""
Clean up unnecessary files while preserving functionality
"""

import os
import shutil
from pathlib import Path

# Files to keep (essential files)
KEEP_FILES = {
    'core.py',           # Main consolidated engine
    'api_simple.py',     # Simplified API
    'main_simple.py',    # Simplified main app
    'test_simplified.py', # Test script
    'cleanup.py',        # This script
    'input_data.json',   # Test data
    # Model files
    'anomaly_model.pkl',
    'scaler.pkl',
    'feature_names.json',
    'feature_stats.json',
    # Output files
    'simplified_results.json',
    'simplified_summary.json',
    'simplified_results.csv'
}

# Files to remove (redundant/complex files)
REMOVE_FILES = {
    'detector.py', 'detector_old.py', 'detector_new.py',
    'preprocessing.py', 'utils.py', 'config.py', 'model.py',
    'pattern_detector.py', 'router.py', 'api.py', 'main.py',
    'batch_processor.py', 'batch_processor_fixed.py', 'run_batch.py',
    'test_debug.py', 'test_debug2.py', 'test_simple.py', 'test_integration.py',
    'test_pattern.py', 'run_tests.py', 'output_results.json',
    'output_summary.json', 'output_results.csv'
}

def cleanup_files():
    """Remove unnecessary files"""
    current_dir = Path('.')
    
    print("Cleaning up anomaly detection files...")
    print("="*50)
    
    removed_count = 0
    kept_count = 0
    
    for file_path in current_dir.iterdir():
        if file_path.is_file():
            filename = file_path.name
            
            if filename in REMOVE_FILES:
                try:
                    file_path.unlink()
                    print(f"Removed: {filename}")
                    removed_count += 1
                except Exception as e:
                    print(f"Failed to remove {filename}: {e}")
            elif filename in KEEP_FILES:
                print(f"Kept: {filename}")
                kept_count += 1
            else:
                print(f"Unknown: {filename}")
    
    print("="*50)
    print(f"Cleanup complete!")
    print(f"Files removed: {removed_count}")
    print(f"Files kept: {kept_count}")
    
    # Show remaining files
    print("\nRemaining files:")
    for file_path in sorted(current_dir.iterdir()):
        if file_path.is_file():
            size_kb = file_path.stat().st_size / 1024
            print(f"  {file_path.name} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    cleanup_files()
