import { AssistanceRequestPayload, AssistanceRequestRecord } from '../types';
import { apiFetch, mockFetch } from './api';

const MOCK_REQUESTS_DB: Record<string, AssistanceRequestRecord> = {
  'SHY-2024-89211': {
    id: 'req-1',
    trackingId: 'SHY-2024-89211',
    types: ['rescue', 'water'],
    householdSize: 5,
    vulnerableCount: { children: 2, elderly: 1, pregnant: 0, disabled: 0 },
    location: {
      district: 'Sunamganj',
      upazila: 'Sunamganj Sadar',
      union: 'Jahangirnagar',
      address: 'Village Nabinagar, Ward 3'
    },
    contact: {
      name: 'Rahim Uddin',
      phone: '01712345678',
      isAnonymous: false
    },
    status: 'In Progress',
    createdAt: '2024-07-15 08:30'
  }
};

export const requestService = {
  async submitRequest(payload: AssistanceRequestPayload): Promise<AssistanceRequestRecord> {
    try {
      const created = await apiFetch<AssistanceRequestRecord>('/api/requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      MOCK_REQUESTS_DB[created.trackingId] = created;
      return created;
    } catch (err) {
      console.warn('Backend unavailable, falling back to local request creation:', err);
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const trackingId = `SHY-2024-${randomNum}`;

      const newRecord: AssistanceRequestRecord = {
        ...payload,
        id: `req-${Date.now()}`,
        trackingId,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      MOCK_REQUESTS_DB[trackingId] = newRecord;
      return mockFetch(newRecord);
    }
  },

  async trackRequest(trackingId: string): Promise<AssistanceRequestRecord | undefined> {
    const cleanId = trackingId.trim().toUpperCase();
    try {
      return await apiFetch<AssistanceRequestRecord>(`/api/requests/track/${encodeURIComponent(cleanId)}`);
    } catch (err) {
      console.warn('Backend unavailable or not found, checking local request tracking:', err);
      const result = MOCK_REQUESTS_DB[cleanId];
      return mockFetch(result);
    }
  },

  async getAllRequests(status?: string, district?: string): Promise<AssistanceRequestRecord[]> {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (district && district !== 'All') params.append('district', district);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    try {
      return await apiFetch<AssistanceRequestRecord[]>(`/api/requests${queryString}`);
    } catch (err) {
      console.warn('Backend requests unavailable, using local cache:', err);
      let list = Object.values(MOCK_REQUESTS_DB);
      if (status && status !== 'All') {
        list = list.filter((r) => r.status.toLowerCase() === status.toLowerCase());
      }
      return mockFetch(list);
    }
  },

  async updateRequestStatus(requestId: string, newStatus: string, notes?: string): Promise<AssistanceRequestRecord> {
    try {
      return await apiFetch<AssistanceRequestRecord>(`/api/requests/${encodeURIComponent(requestId)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, notes })
      });
    } catch (err) {
      console.warn('Backend status update unavailable, fallback:', err);
      const target = Object.values(MOCK_REQUESTS_DB).find((r) => r.id === requestId || r.trackingId === requestId);
      if (target) {
        target.status = newStatus as any;
        if (notes) target.notes = `${target.notes || ''} | ${notes}`;
        return mockFetch(target);
      }
      throw err;
    }
  }
};
