import { AssistanceRequestPayload, AssistanceRequestRecord, RequestStatus, RequestTracking } from '../types';
import { ApiError, apiFetch } from './api';

export interface DispatchTaskInput {
  title: string;
  location: string;
  district: string;
  durationHours: number;
  teamSize: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Citizen requests. Nothing here falls back to fake data: a request that did not reach the
 * server must never look submitted, so errors are passed on to the page.
 */
export const requestService = {
  /** Public, no account needed. */
  submitRequest(payload: AssistanceRequestPayload): Promise<AssistanceRequestRecord> {
    return apiFetch<AssistanceRequestRecord>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /** Public progress view. Returns undefined when the tracking ID does not exist. */
  async trackRequest(trackingId: string): Promise<RequestTracking | undefined> {
    const cleanId = trackingId.trim().toUpperCase();
    try {
      return await apiFetch<RequestTracking>(`/api/requests/track/${encodeURIComponent(cleanId)}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return undefined;
      throw err;
    }
  },

  /** Coordinators only. */
  getAllRequests(status?: string, district?: string): Promise<AssistanceRequestRecord[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (district && district !== 'All') params.append('district', district);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<AssistanceRequestRecord[]>(`/api/requests${queryString}`);
  },

  /** Coordinators only. */
  updateRequestStatus(requestId: string, newStatus: RequestStatus, notes?: string): Promise<AssistanceRequestRecord> {
    return apiFetch<AssistanceRequestRecord>(`/api/requests/${encodeURIComponent(requestId)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, notes })
    });
  },

  /** Coordinators only: creates a volunteer task for the request and marks it Assigned. */
  dispatchRequest(requestId: string, task: DispatchTaskInput): Promise<AssistanceRequestRecord> {
    return apiFetch<AssistanceRequestRecord>(`/api/requests/${encodeURIComponent(requestId)}/dispatch`, {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }
};
