import { MOCK_CAMPAIGNS } from '../data/campaigns';
import { ReliefCampaign } from '../types';
import { apiFetch, mockFetch } from './api';

export const campaignService = {
  async getCampaigns(): Promise<ReliefCampaign[]> {
    try {
      return await apiFetch<ReliefCampaign[]>('/api/campaigns');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local campaigns:', err);
      return mockFetch(MOCK_CAMPAIGNS);
    }
  },

  async getCampaignSummaryStats() {
    try {
      return await apiFetch<{
        activeCampaigns: number;
        householdsReached: string;
        totalRaisedBDT: string;
      }>('/api/campaigns/summary');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local campaign stats:', err);
      const activeCampaigns = MOCK_CAMPAIGNS.length;
      const householdsReached = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.householdsReached, 0);
      const totalRaisedBDT = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.raisedAmount, 0);

      return mockFetch({
        activeCampaigns,
        householdsReached: householdsReached.toLocaleString('en-US'),
        totalRaisedBDT: `৳${(totalRaisedBDT / 100000).toFixed(1)}L`
      });
    }
  }
};
