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
      return await apiFetch<AssistanceRequestRecord>('/api/requests', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
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
  }
};
