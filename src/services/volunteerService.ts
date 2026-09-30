import { VolunteerProfile, VolunteerAssignment, VolunteerDirectoryEntry } from '../types';
import { apiFetch } from './api';

export type DutyAction = 'Checked In' | 'Paused' | 'Completed';

/**
 * Field volunteer operations. Every call acts on the signed-in volunteer; errors such as
 * "another volunteer already accepted this task" (409) are passed on so the page can show them.
 */
export const volunteerService = {
  getProfile(): Promise<VolunteerProfile> {
    return apiFetch<VolunteerProfile>('/api/volunteers/profile');
  },

  getOpenAssignments(): Promise<VolunteerAssignment[]> {
    return apiFetch<VolunteerAssignment[]>('/api/volunteers/assignments');
  },

  acceptAssignment(assignmentId: string): Promise<{ assignment: VolunteerAssignment }> {
    return apiFetch(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/accept`, { method: 'POST' });
  },

  /** Hides an open task for me, or hands my current task back to other volunteers. */
  declineAssignment(assignmentId: string): Promise<VolunteerProfile> {
    return apiFetch<VolunteerProfile>(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/decline`, {
      method: 'POST'
    });
  },

  /** Starts, pauses or completes duty. Hours are counted by the server from the real time on duty. */
  setDuty(status: DutyAction): Promise<VolunteerProfile> {
    return apiFetch<VolunteerProfile>('/api/volunteers/checkin', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  },

  setAvailability(isAvailable: boolean): Promise<VolunteerProfile> {
    return apiFetch<VolunteerProfile>('/api/volunteers/availability', {
      method: 'POST',
      body: JSON.stringify({ isAvailable })
    });
  },

  // ── Coordinator ──
  getAllVolunteers(): Promise<{ count: number; volunteers: VolunteerDirectoryEntry[] }> {
    return apiFetch('/api/volunteers');
  },

  getAllAssignments(status?: string): Promise<VolunteerAssignment[]> {
    const query = status && status !== 'All' ? `?status=${encodeURIComponent(status)}` : '';
    return apiFetch<VolunteerAssignment[]>(`/api/volunteers/assignments/all${query}`);
  },

  createAssignment(data: {
    title: string;
    location: string;
    district: string;
    durationHours?: number;
    teamSize?: number;
    priority?: string;
  }): Promise<VolunteerAssignment> {
    return apiFetch<VolunteerAssignment>('/api/volunteers/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  cancelAssignment(assignmentId: string): Promise<VolunteerAssignment> {
    return apiFetch<VolunteerAssignment>(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/cancel`, {
      method: 'POST'
    });
  },

  setVerification(userId: string, status: 'Verified' | 'Pending' | 'Rejected'): Promise<{ id: string; verification_status: string }> {
    return apiFetch(`/api/volunteers/${encodeURIComponent(userId)}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};
