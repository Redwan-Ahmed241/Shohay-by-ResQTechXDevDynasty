import { FloodAlert } from '../types';

export const MOCK_ALERTS: FloodAlert[] = [
  {
    id: 'alert-1',
    severity: 'CRITICAL',
    type: 'Flash Flood',
    title: 'Extreme Flash Flood Warning — Sunamganj Sadar',
    description: 'Sudden and severe flash flooding across Sunamganj Sadar upazila following unprecedented rainfall in the Meghalaya hills. Water levels rising rapidly. Immediate evacuation of low-lying areas recommended.',
    affectedAreas: ['Sunamganj Sadar', 'Bishwambarpur', 'Tahirpur', 'Derai'],
    issuedAt: '15/07/2024, 06:30',
    verificationStatus: 'Government Verified'
  },
  {
    id: 'alert-2',
    severity: 'HIGH',
    type: 'River Level Warning',
    title: 'Brahmaputra-Jamuna Above Danger Level — Sirajganj',
    description: 'The Brahmaputra-Jamuna at Sirajganj point is 83 cm above danger level and rising. Embankment stress at multiple points. Riverbank erosion accelerating.',
    affectedAreas: ['Sirajganj Sadar', 'Chauhali', 'Belkuchi', 'Kazipur'],
    issuedAt: '15/07/2024, 04:00',
    verificationStatus: 'Government Verified'
  },
  {
    id: 'alert-3',
    severity: 'MEDIUM',
    type: 'Heavy Rainfall',
    title: 'Heavy Rainfall Warning — Netrokona & Mymensingh',
    description: 'BMD forecasts 150–200 mm rainfall in the next 24 hours. Flash flooding risk in haor areas.',
    affectedAreas: ['Netrokona Sadar', 'Khaliajuri', 'Mohanganj'],
    issuedAt: '15/07/2024, 07:00',
    verificationStatus: 'Government Verified'
  },
  {
    id: 'alert-4',
    severity: 'LOW',
    type: 'Road Closure',
    title: 'Road Closure — Kurigram–Chilmari Route N505',
    description: 'N505 is impassable due to flood water. Alternative river route via local boats available.',
    affectedAreas: ['Kurigram Sadar', 'Chilmari', 'Ulipur'],
    issuedAt: '14/07/2024, 18:00',
    verificationStatus: 'Government Verified'
  },
  {
    id: 'alert-5',
    severity: 'MEDIUM',
    type: 'Water Contamination',
    title: 'Drinking Water Contamination — Feni Sadar',
    description: 'Floodwater has contaminated tube wells in Feni Sadar. Risk of waterborne disease. Safe water distribution at 3 points.',
    affectedAreas: ['Feni Sadar', 'Sonagazi', 'Chhagalnaiya'],
    issuedAt: '14/07/2024, 14:00',
    verificationStatus: 'Partner Verified'
  },
  {
    id: 'alert-6',
    severity: 'ALL CLEAR',
    type: 'All Clear',
    title: 'Recovery Update — Habiganj Haor Areas Receding',
    description: 'Water levels in Habiganj haor areas have returned below danger level. Roads in Nabiganj and Lakhai are now accessible.',
    affectedAreas: ['Nabiganj', 'Lakhai', 'Bahubal'],
    issuedAt: '15/07/2024, 05:00',
    verificationStatus: 'Government Verified'
  }
];
