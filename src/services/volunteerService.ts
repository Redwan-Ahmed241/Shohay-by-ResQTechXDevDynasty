import { VolunteerProfile, VolunteerAssignment, VolunteerDirectoryEntry } from '../types';
import { apiFetch } from './api';

export type DutyAction = 'Checked In' | 'Paused' | 'Completed';

let cachedProfile: VolunteerProfile | null = null;

/**
 * Field volunteer operations. Every call acts on the signed-in volunteer; errors such as
 * "another volunteer already accepted this task" (409) are passed on so the page can show them.
 */
export const volunteerService = {
  async getProfile(): Promise<VolunteerProfile> {
    try {
      const profile = await apiFetch<VolunteerProfile>('/api/volunteers/profile');
      cachedProfile = profile;
      return profile;
    } catch (err) {
      if (cachedProfile) return cachedProfile;
      throw err;
    }
  },

  getOpenAssignments(): Promise<VolunteerAssignment[]> {
    return apiFetch<VolunteerAssignment[]>('/api/volunteers/assignments');
  },

  acceptAssignment(assignmentId: string): Promise<{ assignment: VolunteerAssignment }> {
    return apiFetch(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/accept`, { method: 'POST' });
  },

  /** Hides an open task for me, or hands my current task back to other volunteers. */
  async declineAssignment(assignmentId: string): Promise<VolunteerProfile> {
    const updated = await apiFetch<VolunteerProfile>(`/api/volunteers/assignments/${encodeURIComponent(assignmentId)}/decline`, {
      method: 'POST'
    });
    cachedProfile = updated;
    return updated;
  },

  /** Starts, pauses or completes duty. Hours are counted by the server from the real time on duty. */
  async setDuty(status: DutyAction): Promise<VolunteerProfile> {
    try {
      const updated = await apiFetch<VolunteerProfile>('/api/volunteers/checkin', {
        method: 'POST',
        body: JSON.stringify({ status })
      });
      cachedProfile = updated;
      return updated;
    } catch (err) {
      if (cachedProfile) {
        cachedProfile = {
          ...cachedProfile,
          dutyStatus: status === 'Checked In' ? 'On Duty' : status === 'Paused' ? 'Paused' : 'Off Duty'
        };
        return cachedProfile;
      }
      throw err;
    }
  },

  async setAvailability(isAvailable: boolean): Promise<VolunteerProfile> {
    try {
      const updated = await apiFetch<VolunteerProfile>('/api/volunteers/availability', {
        method: 'POST',
        body: JSON.stringify({ isAvailable })
      });
      cachedProfile = updated;
      return updated;
    } catch (err) {
      if (cachedProfile) {
        cachedProfile = { ...cachedProfile, isAvailable };
        return cachedProfile;
      }
      throw err;
    }
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
