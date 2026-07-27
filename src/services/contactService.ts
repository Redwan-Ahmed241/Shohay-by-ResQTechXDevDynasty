import { MOCK_CONTACTS } from '../data/contacts';
import { EmergencyContact, ContactCategory } from '../types';
import { mockFetch } from './api';

export const contactService = {
  async getContacts(category?: ContactCategory | 'All', district?: string | 'All Districts'): Promise<EmergencyContact[]> {
    let results = [...MOCK_CONTACTS];

    if (category && category !== 'All') {
      results = results.filter((c) => c.category === category);
    }

    if (district && district !== 'All Districts') {
      results = results.filter((c) => !c.district || c.district.toLowerCase() === district.toLowerCase());
    }

    return mockFetch(results);
  }
};
