import { MOCK_CAMPAIGNS } from '../data/campaigns';
import { ReliefCampaign } from '../types';
import { mockFetch } from './api';

export const campaignService = {
  async getCampaigns(): Promise<ReliefCampaign[]> {
    return mockFetch(MOCK_CAMPAIGNS);
  },

  async getCampaignSummaryStats() {
    const activeCampaigns = MOCK_CAMPAIGNS.length;
    const householdsReached = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.householdsReached, 0);
    const totalRaisedBDT = MOCK_CAMPAIGNS.reduce((acc, c) => acc + c.raisedAmount, 0);

    return mockFetch({
      activeCampaigns,
      householdsReached: householdsReached.toLocaleString('en-US'),
      totalRaisedBDT: `৳${(totalRaisedBDT / 100000).toFixed(1)}L`
    });
  }
};
