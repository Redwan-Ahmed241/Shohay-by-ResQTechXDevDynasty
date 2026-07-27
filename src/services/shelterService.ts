import { MOCK_SHELTERS } from '../data/shelters';
import { Shelter, ShelterStatus } from '../types';
import { mockFetch } from './api';

export interface ShelterFilterParams {
  status?: ShelterStatus | 'All';
  district?: string | 'All';
  amenities?: Record<string, boolean>;
}

export const shelterService = {
  async getShelters(filters?: ShelterFilterParams): Promise<Shelter[]> {
    let results = [...MOCK_SHELTERS];

    if (filters?.status && filters.status !== 'All') {
      results = results.filter((s) => s.status === filters.status);
    }

    if (filters?.district && filters.district !== 'All') {
      results = results.filter((s) => s.district.toLowerCase() === filters.district?.toLowerCase());
    }

    if (filters?.amenities) {
      const activeKeys = Object.entries(filters.amenities)
        .filter(([_, active]) => active)
        .map(([key]) => key as keyof Shelter['amenities']);

      if (activeKeys.length > 0) {
        results = results.filter((s) => activeKeys.every((key) => s.amenities[key]));
      }
    }

    return mockFetch(results);
  },

  async getShelterSummaryStats() {
    const totalShelters = MOCK_SHELTERS.length;
    const openShelters = MOCK_SHELTERS.filter((s) => s.status === 'Open').length;
    const nearlyFull = MOCK_SHELTERS.filter((s) => s.status === 'Nearly Full').length;
    const freeSpaces = MOCK_SHELTERS.reduce((acc, s) => acc + Math.max(0, s.capacity - s.occupancy), 0);

    return mockFetch({
      totalShelters,
      openShelters,
      nearlyFull,
      freeSpaces: freeSpaces.toLocaleString('en-US')
    });
  }
};
