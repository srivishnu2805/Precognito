import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0f172a" }}>
      <header className="border-b border-[#334155]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#f1f5f9]">Precognito</h1>
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-[#f1f5f9] border border-[#334155] rounded-lg hover:border-[#3b82f6] transition-colors"
          >
            Login
          </Link>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-6">
            IoT Predictive Maintenance
          </h2>
          <p className="text-xl text-[#94a3b8] mb-8 max-w-2xl mx-auto">
            Reduce unplanned downtime with AI-powered monitoring. Real-time vibration analysis, 
            thermal safety alerts, and intelligent RUL predictions.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            Get Started →
          </Link>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-[#334155] rounded-lg p-6" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#3b82f6/20" }}>
                <svg className="w-6 h-6 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-[#94a3b8]">
                Continuous vibration and temperature monitoring with instant anomaly detection.
              </p>
            </div>

            <div className="border border-[#334155] rounded-lg p-6" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#22c55e/20" }}>
                <svg className="w-6 h-6 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Predictive Alerts</h3>
              <p className="text-sm text-[#94a3b8]">
                AI-powered predictions identify failures before they happen.
              </p>
            </div>

            <div className="border border-[#334155] rounded-lg p-6" style={{ backgroundColor: "#1e293b" }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#eab308/20" }}>
                <svg className="w-6 h-6 text-[#eab308]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Mobile PWA</h3>
              <p className="text-sm text-[#94a3b8]">
                Access dashboards on any device. QR check-in for field technicians.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 border-t border-[#334155]">
          <h3 className="text-2xl font-bold text-[#f1f5f9] mb-8 text-center">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">FFT Vibration Analysis</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">RUL Prediction</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">Thermal Safety Monitoring</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">QR-based Field Check-in</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">Inventory Management</span>
            </div>
            <div className="flex items-center gap-3 p-4 border border-[#334155] rounded-lg" style={{ backgroundColor: "#1e293b" }}>
              <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              <span className="text-[#f1f5f9]">Executive Dashboards</span>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 text-center border-t border-[#334155]">
          <h3 className="text-2xl font-bold text-[#f1f5f9] mb-4">Ready to reduce downtime?</h3>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-[#3b82f6] text-white font-medium rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            Get Started →
          </Link>
        </section>
      </main>

      <footer className="border-t border-[#334155]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between text-sm text-[#64748b]">
          <span>© 2026 Precognito. All rights reserved.</span>
          <span>IoT Predictive Maintenance System</span>
        </div>
      </footer>
    </div>
  );
}
