"use client";

import { useState, useEffect, useRef } from "react";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions or use manual input.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const simulateScan = () => {
    const mockData = `ASSET-${Math.random().toString(36).substring(7).toUpperCase()}`;
    onScan(mockData);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md mx-4 bg-[#1e293b] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#334155] flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#f1f5f9]">QR Scanner</h3>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#ef4444]/20 border border-[#ef4444]/30 text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div className="relative aspect-square bg-[#0f172a] rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-[#3b82f6] rounded-lg">
                  <div className="absolute inset-0 border-l-2 border-[#22c55e] animate-pulse" />
                </div>
              </div>
            )}
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-[#94a3b8]">
                <p className="text-center text-sm px-4">
                  Camera preview will appear here
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            {!isScanning ? (
              <button
                onClick={startCamera}
                className="flex-1 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
              >
                Stop Camera
              </button>
            )}
            <button
              onClick={simulateScan}
              className="flex-1 px-4 py-2 bg-[#334155] text-[#f1f5f9] rounded-lg hover:bg-[#475569] transition-colors"
            >
              Demo Scan
            </button>
          </div>

          <div className="border-t border-[#334155] pt-4">
            <p className="text-xs text-[#94a3b8] mb-2 text-center">Or enter asset ID manually</p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter Asset ID (e.g., AST-001)"
                className="flex-1 px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
