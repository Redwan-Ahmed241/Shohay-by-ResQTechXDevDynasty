import { apiFetch } from './api';

export interface DonationInitInput {
  campaignId: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
}

export interface DonationInitResult {
  gatewayUrl: string;
  tranId: string;
}

export interface DonationStatus {
  tranId: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Cancelled';
  amount: number;
  currency: string;
  campaignId: string;
  donorName: string;
  createdAt?: string;
  validatedAt?: string;
}

export const donationService = {
  /** Opens a real SSLCommerz payment session and returns its hosted checkout URL. */
  async initDonation(input: DonationInitInput): Promise<DonationInitResult> {
    return apiFetch<DonationInitResult>('/api/donations/init', {
      method: 'POST',
      body: JSON.stringify({
        campaignId: input.campaignId,
        amount: input.amount,
        donorName: input.donorName,
        donorEmail: input.donorEmail,
        donorPhone: input.donorPhone,
        returnOrigin: window.location.origin
      })
    });
  },

  async getStatus(tranId: string): Promise<DonationStatus> {
    return apiFetch<DonationStatus>(`/api/donations/status/${encodeURIComponent(tranId)}`);
  }
};
