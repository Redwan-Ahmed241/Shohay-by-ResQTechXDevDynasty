import { apiFetch } from './api';
import { donationPayloadSchema, assertValid } from '../utils/validationSchemas';

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
  /** Opens a real SSLCommerz payment session after strict schema validation. */
  async initDonation(input: DonationInitInput): Promise<DonationInitResult> {
    const validated = assertValid(donationPayloadSchema, input);
    return apiFetch<DonationInitResult>('/api/donations/init', {
      method: 'POST',
      body: JSON.stringify({
        campaignId: validated.campaignId,
        amount: validated.amount,
        donorName: validated.donorName,
        donorEmail: validated.donorEmail,
        donorPhone: validated.donorPhone,
        returnOrigin: window.location.origin
      })
    });
  },

  async getStatus(tranId: string): Promise<DonationStatus> {
    return apiFetch<DonationStatus>(`/api/donations/status/${encodeURIComponent(tranId)}`);
  }
};
