import { MOCK_VOLUNTEER_PROFILE, MOCK_VOLUNTEER_ASSIGNMENTS } from '../data/volunteers';
import { VolunteerProfile, VolunteerAssignment } from '../types';
import { mockFetch } from './api';

export const volunteerService = {
  async getProfile(): Promise<VolunteerProfile> {
    return mockFetch(MOCK_VOLUNTEER_PROFILE);
  },

  async getOpenAssignments(): Promise<VolunteerAssignment[]> {
    return mockFetch(MOCK_VOLUNTEER_ASSIGNMENTS);
  },

  async acceptAssignment(assignmentId: string): Promise<boolean> {
    return mockFetch(true);
  },

  async declineAssignment(assignmentId: string): Promise<boolean> {
    return mockFetch(true);
  }
};
