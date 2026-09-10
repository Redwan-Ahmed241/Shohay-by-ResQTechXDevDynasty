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
  }
};
