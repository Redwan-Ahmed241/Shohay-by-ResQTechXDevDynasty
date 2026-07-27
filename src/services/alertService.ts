import { MOCK_ALERTS } from '../data/alerts';
import { FloodAlert, SeverityLevel } from '../types';
import { mockFetch } from './api';

export const alertService = {
  async getAlerts(severityFilter?: SeverityLevel, search?: string): Promise<FloodAlert[]> {
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
  },

  async getAlertById(id: string): Promise<FloodAlert | undefined> {
    const alert = MOCK_ALERTS.find((a) => a.id === id);
    return mockFetch(alert);
  }
};
