"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [ntfyTopic, setNtfyTopic] = useState("precognito_alerts_demo");
  const [notificationPriority, setNotificationPriority] = useState("urgent");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    // In a real app, we would save this to the user profile in the DB
    localStorage.setItem("ntfy_topic", ntfyTopic);
    localStorage.setItem("ntfy_priority", notificationPriority);
    
    setSaveStatus("Settings saved locally!");
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const testNotification = async () => {
    try {
      await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        body: "This is a test notification from the Precognito Dashboard.",
        headers: {
          "Title": "Test Alert",
          "Priority": notificationPriority,
          "Tags": "test,loudspeaker"
        }
      });
      setSaveStatus("Test notification sent!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      console.error("Test failed", err);
      setSaveStatus("Failed to send test.");
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[#f1f5f9] mb-1">System Settings</h1>
        <p className="text-sm text-[#94a3b8]">Configure notifications and system preferences</p>
      </div>

      <section className="bg-[#1e293b] border border-[#334155] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-[#334155]">
          <h2 className="text-lg font-medium text-[#f1f5f9]">External Notifications (NTFY.sh)</h2>
          <p className="text-xs text-[#94a3b8] mt-1">
            Receive real-time alerts on your mobile device or desktop browser without a specialized app.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Alert Topic Name
              </label>
              <input
                type="text"
                value={ntfyTopic}
                onChange={(e) => setNtfyTopic(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
              />
              <p className="text-[10px] text-[#64748b] mt-2">
                Subscribe to this topic at <a href={`https://ntfy.sh/${ntfyTopic}`} target="_blank" className="text-[#3b82f6] hover:underline">ntfy.sh/{ntfyTopic}</a>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                Notification Priority
              </label>
              <select
                value={notificationPriority}
                onChange={(e) => setNotificationPriority(e.target.value)}
                className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="min">Minimal (No noise)</option>
                <option value="low">Low</option>
                <option value="default">Default</option>
                <option value="high">High</option>
                <option value="urgent">Urgent (Overwrites DND)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#3b82f6]/5 border border-[#3b82f6]/20">
            <h4 className="text-sm font-medium text-[#3b82f6] mb-2">How to get alerts on your phone:</h4>
            <ol className="text-xs text-[#94a3b8] list-decimal list-inside space-y-1">
              <li>Install the <strong>ntfy</strong> app from Google Play or App Store.</li>
              <li>Tap "Subscribe to topic".</li>
              <li>Enter <strong>{ntfyTopic}</strong> and tap "Subscribe".</li>
              <li>You will now receive instant push alerts for critical machine failures.</li>
            </ol>
          </div>
        </div>

        <div className="p-6 bg-[#0f172a]/50 border-t border-[#334155] flex items-center justify-between">
          <button
            onClick={testNotification}
            className="px-4 py-2 text-sm text-[#f1f5f9] bg-[#334155] rounded-lg hover:bg-[#475569] transition-colors"
          >
            Send Test Notification
          </button>
          
          <div className="flex items-center gap-4">
            {saveStatus && <span className="text-sm text-[#22c55e]">{saveStatus}</span>}
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-[#3b82f6] rounded-lg hover:bg-[#2563eb] transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#1e293b] border border-[#334155] rounded-lg p-6 opacity-50 cursor-not-allowed">
        <h2 className="text-lg font-medium text-[#f1f5f9]">Email & SMS (Enterprise Only)</h2>
        <p className="text-sm text-[#94a3b8] mt-1">Twilio and SendGrid integrations are currently locked for this prototype.</p>
      </section>
    </div>
  );
}
