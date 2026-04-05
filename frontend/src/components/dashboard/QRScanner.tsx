/**
 * @file QRScanner component for scanning asset QR codes using the device camera.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  expectedAssetId?: string;
}

export function QRScanner({ onScan, onClose, expectedAssetId }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scannerId = "qr-scanner-region";

    scannerRef.current = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(
      (decodedText: string) => {
        if (expectedAssetId && decodedText !== expectedAssetId) {
          setError(`Wrong asset! Expected: ${expectedAssetId}, Scanned: ${decodedText}`);
          setTimeout(() => setError(null), 3000);
          return;
        }
        
        setScanSuccess(true);
        setIsScanning(false);
        
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
        
        setTimeout(() => {
          onScan(decodedText);
        }, 500);
      },
      (errorMessage: string) => {
        if (errorMessage.includes("NotFoundException")) {
          return;
        }
        console.log("QR scan error:", errorMessage);
      }
    );

    setIsScanning(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [expectedAssetId, onScan]);

  const simulateScan = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    
    const mockData = expectedAssetId || `machine_${Math.random().toString(36).substring(7).toLowerCase()}`;
    
    if (expectedAssetId && mockData !== expectedAssetId) {
      setError(`Wrong asset! Expected: ${expectedAssetId}, Scanned: ${mockData}`);
      return;
    }
    
    setScanSuccess(true);
    setIsScanning(false);
    setTimeout(() => {
      onScan(mockData);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 bg-[#1e293b] rounded-2xl overflow-hidden shadow-2xl border border-[#334155]">
        <div className="p-5 border-b border-[#334155] flex items-center justify-between bg-[#0f172a]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#f1f5f9]">Scan QR Code</h3>
              <p className="text-xs text-[#64748b]">Verify asset before completion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-[#334155]/50 flex items-center justify-center text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#334155] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] text-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {error}
            </div>
          )}

          {scanSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-sm flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Asset verified successfully!
            </div>
          )}

          {!scanSuccess && (
            <>
              <div className="relative aspect-square bg-[#0f172a] rounded-2xl overflow-hidden mb-5 border-2 border-[#334155]">
                <div id="qr-scanner-region" className="w-full h-full"></div>
                <div className="absolute inset-0 pointer-events-none border-2 border-[#3b82f6]/30 rounded-2xl m-4 animate-pulse"></div>
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-[#94a3b8]">
                  Position the QR code within the frame
                </p>
                {expectedAssetId && (
                  <p className="text-xs text-[#64748b] mt-2">
                    Expected: <span className="text-[#3b82f6] font-medium">{expectedAssetId}</span>
                  </p>
                )}
              </div>

              <button
                onClick={simulateScan}
                className="w-full py-3.5 bg-[#334155] text-[#f1f5f9] rounded-xl font-medium hover:bg-[#475569] transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Demo Scan (Test)
              </button>
            </>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        #qr-scanner-region video {
          border-radius: 12px !important;
        }
        #qr-scanner-region img {
          display: none !important;
        }
        #qr-scanner-region .html5-qrcode-scanner {
          background: transparent !important;
        }
        #qr-scanner-region .html5-qrcode-scanner > div {
          background: transparent !important;
        }
        #qr-scanner-region .html5-qrcode-scanner img {
          display: none !important;
        }
        #qr-scanner-region .html5-text-elem {
          display: none !important;
        }
        #qr-scanner-region #qr-shaded-region {
          border-radius: 16px !important;
        }
      `}</style>
    </div>
  );
}