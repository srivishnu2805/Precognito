import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // Better Auth handles session via cookies automatically if on the same domain
  // But for cross-origin or explicit handling, we can check the session
  const session = await authClient.getSession();
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  // If we need to pass a token explicitly (e.g., if cookies aren't shared)
  // we can get it from the session. For now, we'll rely on cookies.

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized - maybe redirect to login or refresh token
    console.error("Unauthorized request");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || response.statusText);
  }

  return response.json();
}

export const api = {
  getAssets: () => fetchWithAuth("/assets"),
  getAssetTelemetry: (id: string, range?: string) => 
    fetchWithAuth(`/assets/${id}/telemetry${range ? `?range=${range}` : ""}`),
  getAssetPredictions: (id: string, range?: string) => 
    fetchWithAuth(`/assets/${id}/predictions${range ? `?range=${range}` : ""}`),
  getAlerts: (range?: string) => 
    fetchWithAuth(`/alerts${range ? `?range=${range}` : ""}`),
  getAuditLogs: () => fetchWithAuth("/audit-logs"),
  submitModelFeedback: (data: { anomalyId: string, deviceId: string, isReal: boolean }) => 
    fetchWithAuth("/model-feedback", { method: "POST", body: JSON.stringify(data) }),
  getModelMetrics: () => fetchWithAuth("/analytics/metrics"),
  getOEEMetrics: (deviceId?: string) => 
    fetchWithAuth(`/analytics/oee${deviceId ? `?device_id=${deviceId}` : ""}`),
  getSafetyAlerts: (range?: string) => 
    fetchWithAuth(`/safety-alerts${range ? `?range=${range}` : ""}`),
  getInventory: () => fetchWithAuth("/inventory"),
  getJITAlerts: () => fetchWithAuth("/inventory/jit-alerts"),
  reservePart: (data: { partId: number, workOrderId?: number, quantity: number }) => 
    fetchWithAuth("/inventory/reserve", { method: "POST", body: JSON.stringify(data) }),
};
