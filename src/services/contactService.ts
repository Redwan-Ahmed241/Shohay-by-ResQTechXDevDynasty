import { MOCK_CONTACTS } from '../data/contacts';
import { EmergencyContact, ContactCategory } from '../types';
import { apiFetch, mockFetch } from './api';

export const contactService = {
  async getContacts(category?: ContactCategory | 'All', district?: string | 'All Districts'): Promise<EmergencyContact[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') {
        params.append('category', category);
      }
      if (district && district !== 'All Districts') {
        params.append('district', district);
      }
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      return await apiFetch<EmergencyContact[]>(`/api/contacts${queryStr}`);
    } catch (err) {
      console.warn('Backend unavailable, falling back to local contacts:', err);
      let results = [...MOCK_CONTACTS];

      if (category && category !== 'All') {
        results = results.filter((c) => c.category === category);
      }

      if (district && district !== 'All Districts') {
        results = results.filter((c) => !c.district || c.district.toLowerCase() === district.toLowerCase());
      }

      return mockFetch(results);
    }
  }
};
