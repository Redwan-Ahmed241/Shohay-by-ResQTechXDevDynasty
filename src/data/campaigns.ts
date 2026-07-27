import { ReliefCampaign } from '../types';

export const MOCK_CAMPAIGNS: ReliefCampaign[] = [
  {
    id: 'camp-1',
    title: 'Sylhet Flash Flood Emergency Response 2024',
    organization: 'BRAC Bangladesh',
    district: 'Sylhet Division',
    coverageAreas: ['Sunamganj', 'Sylhet', 'Habiganj'],
    targetAmount: 5000000,
    raisedAmount: 3240000,
    householdsTarget: 5000,
    householdsReached: 2840,
    verificationStatus: 'Government Verified'
  },
  {
    id: 'camp-2',
    title: 'Sirajganj Jamuna Riverbank Community Support',
    organization: 'ActionAid Bangladesh',
    district: 'Sirajganj District',
    coverageAreas: ['Sirajganj Sadar', 'Chauhali'],
    targetAmount: 2800000,
    raisedAmount: 1650000,
    householdsTarget: 3000,
    householdsReached: 1350,
    verificationStatus: 'Partner Verified'
  },
  {
    id: 'camp-3',
    title: 'Kurigram Flood Recovery Fund',
    organization: 'CARE Bangladesh',
    district: 'Kurigram & Gaibandha Districts',
    coverageAreas: ['Kurigram', 'Gaibandha'],
    targetAmount: 6000000,
    raisedAmount: 890000,
    householdsTarget: 4000,
    householdsReached: 120,
    verificationStatus: 'Government Verified'
  }
];
