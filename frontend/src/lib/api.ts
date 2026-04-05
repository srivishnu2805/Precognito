/**
 * @fileoverview API client for interacting with the backend.
 */

import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Common fetch with auth handling.
 *
 * @param {string} endpoint The endpoint to fetch.
 * @param {RequestInit} [options={}] Additional fetch options.
 * @returns {Promise<any>} The parsed JSON response.
 * @throws {Error} If the response is not OK.
 */
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
    credentials: "include",
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

/**
 * Input interface for creating a new asset.
 */
export interface CreateAssetInput {
  /** The unique identifier of the asset. */
  assetId: string;
  /** The human-readable name of the asset. */
  assetName: string;
  /** Optional URL or path to the asset manual. */
  manual?: string;
  /** Optional Mean Time To Repair benchmark. */
  mttr?: string;
}

/**
 * Input interface for creating a new audit/work order.
 */
export interface CreateAuditInput {
  /** The unique identifier of the asset. */
  assetId: string;
  /** The initial status for the work order. */
  status: string;
  /** Optional remarks or notes. */
  remarks?: string;
  /** Optional technician assigned to the task. */
  assignedTo?: string;
}

/**
 * Input interface for completing a work order.
 */
export interface CompleteWorkOrderInput {
  /** Detailed description of the resolution. */
  resolution: string;
  /** Optional ID of a spare part used. */
  partId?: number;
  /** Quantity of the spare part used. */
  quantityUsed: number;
  /** Total labor hours spent on the repair. */
  laborHours: number;
}

/**
 * Backend response for device heartbeat data.
 */
export interface HeartbeatResponse {
  /** The unique device identifier. */
  deviceId: string;
  /** ISO timestamp of the last seen heartbeat. */
  lastSeen: string;
  /** Current operational status. */
  status: "Active" | "Inactive";
  /** Seconds elapsed since the last heartbeat. */
  secondsSinceLast: number;
}

/**
 * Object containing all API interaction methods.
 */
export const api = {
  /**
   * Fetches all assets.
   *
   * @returns {Promise<any>} List of assets.
   */
  getAssets: () => fetchWithAuth("/assets"),
  
  /**
   * Fetches telemetry for a specific asset.
   *
   * @param {string} id The asset ID.
   * @param {string} [range] The time range for telemetry.
   * @returns {Promise<any>} Asset telemetry data.
   */
  getAssetTelemetry: (id: string, range?: string) => 
    fetchWithAuth(`/assets/${id}/telemetry${range ? `?range=${range}` : ""}`),
  
  /**
   * Fetches predictions for a specific asset.
   *
   * @param {string} id The asset ID.
   * @param {string} [range] The time range for predictions.
   * @returns {Promise<any>} Asset prediction data.
   */
  getAssetPredictions: (id: string, range?: string) => 
    fetchWithAuth(`/assets/${id}/predictions${range ? `?range=${range}` : ""}`),
  
  /**
   * Fetches all alerts.
   *
   * @param {string} [range] The time range for alerts.
   * @returns {Promise<any>} List of alerts.
   */
  getAlerts: (range?: string) => 
    fetchWithAuth(`/alerts${range ? `?range=${range}` : ""}`),
  
  /**
   * Fetches audit logs.
   *
   * @returns {Promise<any>} List of audit logs.
   */
  getAuditLogs: () => fetchWithAuth("/audit-logs"),
  
  /**
   * Submits feedback for anomaly detection.
   *
   * @param {Object} data Feedback data.
   * @param {string} data.anomalyId The ID of the anomaly.
   * @param {string} data.deviceId The ID of the device.
   * @param {boolean} data.isReal Whether the anomaly was a true positive.
   * @returns {Promise<any>} Result of the submission.
   */
  submitModelFeedback: (data: { anomalyId: string, deviceId: string, isReal: boolean }) => 
    fetchWithAuth("/model-feedback", { method: "POST", body: JSON.stringify(data) }),
  
  /**
   * Fetches model accuracy metrics.
   *
   * @returns {Promise<any>} Model accuracy metrics.
   */
  getModelMetrics: () => fetchWithAuth("/analytics/metrics"),
  
  /**
   * Fetches OEE metrics.
   *
   * @param {string} [deviceId] Optional device ID to filter by.
   * @returns {Promise<any>} OEE metrics data.
   */
  getOEEMetrics: (deviceId?: string) => 
    fetchWithAuth(`/analytics/oee${deviceId ? `?device_id=${deviceId}` : ""}`),
  
  /**
   * Fetches safety alerts.
   *
   * @param {string} [range] The time range for safety alerts.
   * @returns {Promise<any>} List of safety alerts.
   */
  getSafetyAlerts: (range?: string) => 
    fetchWithAuth(`/safety-alerts${range ? `?range=${range}` : ""}`),
  
  /**
   * Fetches all inventory items.
   *
   * @returns {Promise<any>} List of inventory items.
   */
  getInventory: () => fetchWithAuth("/inventory"),
  
  /**
   * Fetches just-in-time inventory alerts.
   *
   * @returns {Promise<any>} List of JIT alerts.
   */
  getJITAlerts: () => fetchWithAuth("/inventory/jit-alerts"),
  
  /**
   * Reserves a part for a work order.
   *
   * @param {Object} data Reservation data.
   * @param {number} data.partId The ID of the part.
   * @param {number} [data.workOrderId] The ID of the work order.
   * @param {number} data.quantity The quantity to reserve.
   * @returns {Promise<any>} Result of the reservation.
   */
  reservePart: (data: { partId: number, workOrderId?: number, quantity: number }) => 
    fetchWithAuth("/inventory/reserve", { method: "POST", body: JSON.stringify(data) }),
  /**
   * Fetches maintenance recommendations.
   *
   * @param {string} [period="monthly"] The time period for recommendations.
   * @param {string} [machineId] Optional machine ID to filter by.
   * @returns {Promise<any>} Maintenance recommendations data.
   */
  getRecommendations: (period: string = "monthly", machineId?: string) => 
    fetchWithAuth(`/admin-reporting/recommendations?period=${period}${machineId ? `&machine_id=${machineId}` : ""}`),
  /**
   * Fetches overall system health status.
   *
   * @returns {Promise<any>} System health data.
   */
   getSystemHealth: () => fetchWithAuth("/admin-reporting/health"),
   
   getAuditCompliance: () => fetchWithAuth("/admin-reporting/audit"),
   
   /**
   * Fetches device heartbeats.
   *
   * @returns {Promise<any>} List of device heartbeats.
   */
  getHeartbeats: () => fetchWithAuth("/heartbeats"),

  /**
   * Fetches all work orders.
   *
   * @returns {Promise<any>} List of work orders.
   */
  getWorkOrders: () => fetchWithAuth("/work-orders"),

  /**
   * Creates a new asset.
   *
   * @param {Object} data Asset data.
   * @returns {Promise<any>} The created asset.
   */
  createAsset: (data: CreateAssetInput) => 
    fetchWithAuth("/work-orders/assets/", { method: "POST", body: JSON.stringify(data) }),

  /**
   * Creates a new audit (work order).
   *
   * @param {Object} data Audit data.
   * @returns {Promise<any>} The created audit.
   */
  createAudit: (data: CreateAuditInput) => 
    fetchWithAuth("/work-orders/audit/", { method: "POST", body: JSON.stringify(data) }),

  /**
   * Completes a work order.
   *
   * @param {number} id The work order ID.
   * @param {Object} data Completion data.
   * @returns {Promise<any>} The result.
   */
  completeWorkOrder: (id: number, data: CompleteWorkOrderInput) => 
    fetchWithAuth(`/work-orders/audit/${id}/complete`, { method: "PATCH", body: JSON.stringify(data) }),
};
