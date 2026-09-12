import { MOCK_VOLUNTEER_PROFILE, MOCK_VOLUNTEER_ASSIGNMENTS } from '../data/volunteers';
import { VolunteerProfile, VolunteerAssignment } from '../types';
import { apiFetch, mockFetch } from './api';

export const volunteerService = {
  async getProfile(): Promise<VolunteerProfile> {
    try {
      return await apiFetch<VolunteerProfile>('/api/volunteers/profile');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local volunteer profile:', err);
      return mockFetch(MOCK_VOLUNTEER_PROFILE);
    }
  },

  async getOpenAssignments(): Promise<VolunteerAssignment[]> {
    try {
      return await apiFetch<VolunteerAssignment[]>('/api/volunteers/assignments');
    } catch (err) {
      console.warn('Backend unavailable, falling back to local assignments:', err);
      return mockFetch(MOCK_VOLUNTEER_ASSIGNMENTS);
    }
  },

  async acceptAssignment(assignmentId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/accept`, {
        method: 'POST'
      });
      return true;
    } catch (err) {
      console.warn('Backend unavailable, falling back to local assignment acceptance:', err);
      return mockFetch(true);
    }
  },

  async declineAssignment(assignmentId: string): Promise<boolean> {
    try {
      await apiFetch(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/decline`, {
        method: 'POST'
      });
      return true;
    } catch (err) {
      console.warn('Backend unavailable, falling back to local assignment decline:', err);
      return mockFetch(true);
    }
  },

  async getAllVolunteers(): Promise<{ count: number; volunteers: any[] }> {
    try {
      return await apiFetch<{ count: number; volunteers: any[] }>('/api/volunteers');
    } catch (err) {
      console.warn('Backend volunteers unavailable, using fallback:', err);
      return mockFetch({
        count: 6,
        volunteers: [
          { id: 'vol-1', firstName: 'Nasrin', lastName: 'Akter', role: 'fieldworker', phone_number: '01812345678', district: 'Sunamganj', skills: ['Boat Rescue', 'First Aid'], equipment: ['Speedboat', 'VHF Radio'], verification_status: 'Verified' },
          { id: 'vol-2', firstName: 'Karim', lastName: 'Uddin', role: 'fieldworker', phone_number: '01712345679', district: 'Sirajganj', skills: ['Relief Logistics', 'Shelter Admin'], equipment: ['First Aid Kit'], verification_status: 'Verified' },
          { id: 'vol-3', firstName: 'Rahim', lastName: 'Ahmed', role: 'fieldworker', phone_number: '01712345678', district: 'Sunamganj', skills: ['Water Rescue'], equipment: ['Life Jackets'], verification_status: 'Verified' }
        ]
      });
    }
  },

  async createAssignment(data: {
    title: string;
    location: string;
    district: string;
    durationHours?: number;
    teamSize?: number;
    priority?: string;
  }): Promise<VolunteerAssignment> {
    try {
      return await apiFetch<VolunteerAssignment>('/api/volunteers/assignments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.warn('Backend create assignment unavailable, fallback:', err);
      const newA: VolunteerAssignment = {
        id: `assign-${Date.now()}`,
        title: data.title,
        location: data.location,
        district: data.district,
        durationHours: data.durationHours || 4,
        teamSize: data.teamSize || 4,
        priority: (data.priority as any) || 'high',
        status: 'Available'
      };
      return mockFetch(newA);
    }
  },

  async checkIn(status: string = 'Checked In', hours: number = 1): Promise<any> {
    try {
      return await apiFetch('/api/volunteers/checkin', {
        method: 'POST',
        body: JSON.stringify({ status, hours })
      });
    } catch (err) {
      console.warn('Backend checkin unavailable, fallback:', err);
      return mockFetch({ status, hoursLogged: hours });
    }
  }
};
