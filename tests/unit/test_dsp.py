import pytest
import numpy as np
from precognito.ingestion.dsp import calculate_rms, extract_fft_peaks, process_raw_edge_data

def test_calculate_rms():
    # Constant signal
    samples = np.array([1.0, 1.0, 1.0])
    assert calculate_rms(samples) == 1.0
    
    # Zero signal
    samples = np.array([0.0, 0.0])
    assert calculate_rms(samples) == 0.0
    
    # Simple sine wave RMS is A/sqrt(2)
    t = np.linspace(0, 1, 1000)
    samples = 10.0 * np.sin(2 * np.pi * 50 * t)
    assert pytest.approx(calculate_rms(samples), 0.1) == 7.07

def test_extract_fft_peaks():
    # 50Hz signal
    t = np.linspace(0, 1, 1000)
    samples = 5.0 * np.sin(2 * np.pi * 20 * t) # 20Hz is in our 1x band
    peaks = extract_fft_peaks(samples)
    
    assert peaks["freq_spike_1x"] > 0
    assert peaks["freq_spike_bpfo"] < peaks["freq_spike_1x"]

def test_process_raw_edge_data():
    raw_values = [1.0, -1.0, 1.0, -1.0]
    result = process_raw_edge_data(raw_values)
    
    assert "vibration_rms" in result
    assert "freq_spike_1x" in result
    assert "freq_spike_bpfo" in result
    assert result["vibration_rms"] == 1.0
