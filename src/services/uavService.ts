/* ═══════════════════════════════════════════════════════════
   SHOHAY UAV Service — drone monitoring (ResQTech FYDP module)
   ═══════════════════════════════════════════════════════════ */

import { AssistanceRequestRecord, UavDetection, UavDrone, UavLogEntry, UavRescuerAssignment } from '../types';
import { apiFetch } from './api';

export const uavService = {
  /** Coordinators: every drone. Volunteers: only drones assigned to them. */
  getDrones(): Promise<UavDrone[]> {
    return apiFetch<UavDrone[]>('/api/uav/drones');
  },

  /** Returns the drone's API key once; it cannot be shown again. */
  registerDrone(input: { name: string; registration_id: string; district?: string; stream_url?: string }): Promise<UavDrone & { apiKey: string }> {
    return apiFetch('/api/uav/drones', { method: 'POST', body: JSON.stringify(input) });
  },

  rotateKey(droneId: string): Promise<UavDrone & { apiKey: string }> {
    return apiFetch(`/api/uav/drones/${encodeURIComponent(droneId)}/rotate-key`, { method: 'POST' });
  },

  /** Newest first. Pass `since` (the newest createdAt you already have) to poll for new ones only. */
  getDetections(options: { since?: string; status?: string; limit?: number } = {}): Promise<UavDetection[]> {
    const params = new URLSearchParams();
    if (options.since) params.set('since', options.since);
    if (options.status && options.status !== 'All') params.set('status', options.status);
    params.set('limit', String(options.limit ?? 50));
    return apiFetch<UavDetection[]>(`/api/uav/detections?${params.toString()}`);
  },

  acknowledge(detectionId: string): Promise<UavDetection> {
    return apiFetch(`/api/uav/detections/${encodeURIComponent(detectionId)}/acknowledge`, { method: 'POST' });
  },

  dismiss(detectionId: string): Promise<UavDetection> {
    return apiFetch(`/api/uav/detections/${encodeURIComponent(detectionId)}/dismiss`, { method: 'POST' });
  },

  /** Turns a detection into a Verified rescue request in the normal request queue. */
  createRescueRequest(detectionId: string): Promise<{ detection: UavDetection; request: AssistanceRequestRecord }> {
    return apiFetch(`/api/uav/detections/${encodeURIComponent(detectionId)}/rescue-request`, { method: 'POST' });
  },

  getAssignments(): Promise<UavRescuerAssignment[]> {
    return apiFetch<UavRescuerAssignment[]>('/api/uav/assignments');
  },

  assignRescuer(userId: string, droneId: string): Promise<UavRescuerAssignment> {
    return apiFetch('/api/uav/assignments', { method: 'POST', body: JSON.stringify({ user_id: userId, drone_id: droneId }) });
  },

  unassignRescuer(assignmentId: string): Promise<void> {
    return apiFetch(`/api/uav/assignments/${encodeURIComponent(assignmentId)}`, { method: 'DELETE' });
  },

  getLogs(limit = 100): Promise<UavLogEntry[]> {
    return apiFetch<UavLogEntry[]>(`/api/uav/logs?limit=${limit}`);
  }
};
