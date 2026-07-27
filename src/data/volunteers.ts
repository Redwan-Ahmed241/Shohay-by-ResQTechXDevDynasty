import { VolunteerProfile, VolunteerAssignment } from '../types';

export const MOCK_VOLUNTEER_ASSIGNMENTS: VolunteerAssignment[] = [
  {
    id: 'assign-1',
    title: 'Food Distribution — Sunamganj Sadar',
    location: 'Sunamganj Sadar',
    district: 'Sunamganj',
    durationHours: 4,
    teamSize: 5,
    priority: 'high',
    status: 'Available'
  },
  {
    id: 'assign-2',
    title: 'Boat Rescue Support — Tahirpur',
    location: 'Tahirpur',
    district: 'Sunamganj',
    durationHours: 6,
    teamSize: 4,
    priority: 'critical',
    status: 'Available'
  },
  {
    id: 'assign-3',
    title: 'Shelter Registration Desk — Sirajganj',
    location: 'Sirajganj Sadar',
    district: 'Sirajganj',
    durationHours: 8,
    teamSize: 3,
    priority: 'medium',
    status: 'Available'
  }
];

export const MOCK_VOLUNTEER_PROFILE: VolunteerProfile = {
  id: 'vol-1',
  name: 'Demo Volunteer',
  code: 'VOL-2024-DEMO',
  district: 'Sunamganj',
  joinDate: '12 July 2024',
  isAvailable: true,
  hoursLogged: 24,
  tasksCompleted: 7,
  rating: 4.8,
  skills: ['Food Distribution', 'Administration', 'Psychosocial Support'],
  currentAssignment: {
    id: 'assign-active',
    title: 'Food Distribution — Sunamganj College Shelter',
    location: 'Sunamganj Sadar',
    district: 'Sunamganj',
    durationHours: 4,
    teamSize: 5,
    priority: 'high',
    status: 'In Progress'
  }
};
