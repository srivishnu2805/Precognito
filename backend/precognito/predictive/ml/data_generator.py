import os
import pandas as pd
import numpy as np

def generate_telemetry_data(num_machines=50, max_cycles=1000):
    np.random.seed(42)
    data = []
    
    for machine_id in range(1, num_machines + 1):
        # Random lifecycle duration
        min_cycles = min(400, max_cycles - 1)
        lifecycle = np.random.randint(min_cycles, max_cycles)
        
        # Decide the dominant fault for this machine
        fault_type = np.random.choice(["Bearing Wear", "Misalignment"])
        
        vibration_rms = 1.0 # Baseline healthy reading
        temperature = 45.0  # Baseline temp
        
        for cycle in range(lifecycle):
            # Calculate remaining useful life in hours (Assuming 1 cycle = 1 hour)
            rul = lifecycle - cycle
            
            # Exponential degradation over the lifecycle
            degradation_factor = (cycle / lifecycle) ** 3
            
            # Vibration increases over time perfectly
            if fault_type == "Misalignment":
                vibration_rms = 1.0 + (degradation_factor * 8.0)
                freq_spike_1x = 0.8 * degradation_factor
                freq_spike_bpfo = 0.0
            else: # Bearing Wear
                vibration_rms = 1.0 + (degradation_factor * 5.0)
                freq_spike_1x = 0.0
                freq_spike_bpfo = 0.9 * degradation_factor
            
            # Temperature increases exponentially but late in the failure horizon
            temperature = 45.0 + (degradation_factor * 50.0)
            
            # Label as Normal until late stage, then specific fault
            current_fault = "Normal"
            if rul < 200: # Final 200 hours shows significant signs
                current_fault = fault_type

            data.append({
                "machine_id": machine_id,
                "cycle": cycle,
                "vibration_rms": max(0, vibration_rms),
                "temperature": max(20, temperature),
                "freq_spike_1x": max(0, freq_spike_1x),
                "freq_spike_bpfo": max(0, freq_spike_bpfo),
                "fault_type": current_fault,
                "rul": rul
            })
            
    df = pd.DataFrame(data)
    os.makedirs('data', exist_ok=True)
    df.to_csv("data/telemetry_dataset.csv", index=False)
    print(f"Generated {len(df)} telemetry records with RUL and Fault Types at data/telemetry_dataset.csv")

if __name__ == "__main__":
    generate_telemetry_data()
