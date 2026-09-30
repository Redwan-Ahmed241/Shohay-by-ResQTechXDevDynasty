import { useQuery } from '@tanstack/react-query';
import { alertService } from '../services/alertService';
import { shelterService, ShelterFilterParams } from '../services/shelterService';
import { campaignService } from '../services/campaignService';
import { contactService } from '../services/contactService';
import { requestService } from '../services/requestService';
import { SeverityLevel, ContactCategory } from '../types';

export function useAlerts(severity: SeverityLevel | 'All', search: string) {
  const filter = severity === 'All' ? undefined : severity;
  return useQuery({
    queryKey: ['alerts', filter, search],
    queryFn: () => alertService.getAlerts(filter, search)
  });
}

export function useShelters(filters: ShelterFilterParams) {
  return useQuery({
    queryKey: ['shelters', filters],
    queryFn: () => shelterService.getShelters(filters)
  });
}

export function useShelterSummary() {
  return useQuery({
    queryKey: ['shelters', 'summary'],
    queryFn: () => shelterService.getShelterSummaryStats()
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getCampaigns()
  });
}

export function useCampaignSummary() {
  return useQuery({
    queryKey: ['campaigns', 'summary'],
    queryFn: () => campaignService.getCampaignSummaryStats()
  });
}

export function useContacts(category: ContactCategory | 'All', district: string) {
  return useQuery({
    queryKey: ['contacts', category, district],
    queryFn: () => contactService.getContacts(category, district)
  });
}

/** Only fetches once signed in — there's nothing to show for an anonymous visitor. */
export function useMyRequests(enabled: boolean) {
  return useQuery({
    queryKey: ['requests', 'mine'],
    queryFn: () => requestService.getMyRequests(),
    enabled,
    staleTime: 10_000
  });
}
