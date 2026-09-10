import { MOCK_ALERTS } from '../data/alerts';
import { FloodAlert, SeverityLevel } from '../types';
import { apiFetch, mockFetch } from './api';

export const alertService = {
  async getAlerts(severityFilter?: SeverityLevel, search?: string): Promise<FloodAlert[]> {
    try {
      const params = new URLSearchParams();
      if (severityFilter && severityFilter !== 'ALL CLEAR') {
        params.append('severity', severityFilter);
      } else if (severityFilter === 'ALL CLEAR') {
        params.append('severity', 'ALL CLEAR');
      }
      if (search && search.trim()) {
        params.append('search', search.trim());
      }
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await apiFetch<FloodAlert[]>(`/api/alerts${queryStr}`);
    } catch (err) {
      console.warn('Backend unavailable, falling back to local alerts:', err);
      let results = [...MOCK_ALERTS];
      if (severityFilter && severityFilter !== 'ALL CLEAR') {
        results = results.filter((alert) => alert.severity === severityFilter);
      } else if (severityFilter === 'ALL CLEAR') {
        results = results.filter((alert) => alert.severity === 'ALL CLEAR');
      }
      if (search && search.trim()) {
        const q = search.toLowerCase().trim();
        results = results.filter(
          (alert) =>
            alert.title.toLowerCase().includes(q) ||
            alert.description.toLowerCase().includes(q) ||
            alert.affectedAreas.some((area) => area.toLowerCase().includes(q))
        );
      }
      return mockFetch(results);
    }
  },

  async getAlertById(id: string): Promise<FloodAlert | undefined> {
    try {
      return await apiFetch<FloodAlert>(`/api/alerts/${encodeURIComponent(id)}`);
    } catch (err) {
      console.warn('Backend unavailable, falling back to local alert:', err);
      const alert = MOCK_ALERTS.find((a) => a.id === id);
      return mockFetch(alert);
    }
  }
};
