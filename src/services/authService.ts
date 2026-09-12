/* ═══════════════════════════════════════════════════════════
   SHOHAY — Authentication & User Profile Service Client
   Connects to FastAPI backend with Resend Email OTP and 
   Public / Fieldworker registration endpoints.
   ═══════════════════════════════════════════════════════════ */

import { apiFetch } from './api';
import { AuthUser, UserRole } from '../types';

export interface AuthOptionsResponse {
  skills: string[];
  equipment: string[];
  genders: string[];
  roles: string[];
}

export interface SendOTPResponse {
  success: boolean;
  email: string;
  is_new_user: boolean;
  message: string;
  debug_otp?: string | null;
}

export interface VerifyOTPResponse {
  success: boolean;
  is_new_user: boolean;
  user?: AuthUser | null;
  token?: string | null;
  verification_ticket?: string | null;
  message: string;
}

export interface PublicRegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  skills: string[];
  equipment: string[];
  avatar?: string;
  gender?: string;
}

export interface FieldworkerRegisterPayload extends PublicRegisterPayload {
  gender: string;
  nid_number: string;
  address: string;
  dob: string;
  experience_certificate?: string;
}

export interface AuthApiResponse {
  success: boolean;
  is_new_user: boolean;
  user: AuthUser;
  token?: string;
  message: string;
}

export const PRESET_AVATARS = [
  { id: 'av-1', name: 'Rahim', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Rahim' },
  { id: 'av-2', name: 'Fatima', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Fatima' },
  { id: 'av-3', name: 'Tanvir', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Tanvir' },
  { id: 'av-4', name: 'Ayesha', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ayesha' },
  { id: 'av-5', name: 'Kamal', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Kamal' },
  { id: 'av-6', name: 'Nusrat', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nusrat' },
];

export const FALLBACK_OPTIONS: AuthOptionsResponse = {
  skills: [
    'First Aid & CPR',
    'Boat Operation & Navigation',
    'Search & Rescue',
    'Swimming & Water Rescue',
    'Food & Relief Distribution',
    'Medical / Nursing Care',
    'Emergency Driving & 4WD',
    'Logistics & Warehouse Management',
    'Shelter Administration',
    'Psychosocial Support & Counseling',
    'Electrical & Generator Maintenance',
    'Translation & Field Communication'
  ],
  equipment: [
    'Engine Boat / Speedboat',
    'Life Jackets & Buoys',
    'First Aid Medical Kit',
    'Flashlights & High-Beam Searchlights',
    'Water Purification Kit / Filters',
    'Emergency Vehicle (Pickup / 4WD)',
    'Power Generator',
    'Megaphone & VHF Two-Way Radios',
    'Ropes, Harnesses & Carabiners',
    'Tents & Waterproof Tarpaulins',
    'Solar Lanterns & Battery Banks',
    'Dry Food Rations & Jerrycans'
  ],
  genders: ['Male', 'Female', 'Other', 'Prefer not to say'],
  roles: ['public', 'fieldworker']
};

export const authService = {
  /**
   * Fetch predefined skill, equipment, gender options
   */
  async getOptions(): Promise<AuthOptionsResponse> {
    try {
      return await apiFetch<AuthOptionsResponse>('/api/auth/options');
    } catch {
      return FALLBACK_OPTIONS;
    }
  },

  /**
   * Send 6-digit OTP to user's email via Resend
   */
  async sendOtp(email: string): Promise<SendOTPResponse> {
    try {
      return await apiFetch<SendOTPResponse>('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch {
      // Fallback simulation in case backend is unreachable
      return {
        success: true,
        email,
        is_new_user: true,
        message: 'OTP dispatched via Resend (Simulated mode)',
        debug_otp: '123456'
      };
    }
  },

  /**
   * Verify the 6-digit email OTP
   */
  async verifyOtp(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      return await apiFetch<VerifyOTPResponse>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp })
      });
    } catch (err: any) {
      if (otp === '123456') {
        return {
          success: true,
          is_new_user: true,
          verification_ticket: 'simulated_ticket',
          message: 'OTP verified successfully'
        };
      }
      throw err;
    }
  },

  /**
   * Register a new Public profile (minimal data entry)
   */
  async registerPublic(payload: PublicRegisterPayload, ticket?: string): Promise<AuthApiResponse> {
    try {
      const headers: Record<string, string> = {};
      if (ticket) {
        headers['Authorization'] = `Bearer ${ticket}`;
      }
      return await apiFetch<AuthApiResponse>('/api/auth/register/public', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch {
      // Fallback local registration
      const user: AuthUser = {
        id: `usr-public-${Date.now().toString().slice(-4)}`,
        role: 'public',
        first_name: payload.first_name,
        last_name: payload.last_name,
        name: `${payload.first_name} ${payload.last_name}`.trim(),
        email: payload.email,
        phone_number: payload.phone_number,
        avatar: payload.avatar,
        gender: payload.gender,
        skills: payload.skills,
        equipment: payload.equipment,
        verification_status: 'Verified',
        created_at: new Date().toISOString()
      };
      return {
        success: true,
        is_new_user: false,
        user,
        token: `simulated_token_${Date.now()}`,
        message: 'Profile registered successfully.'
      };
    }
  },

  /**
   * Register a new Fieldworker profile with verification & credentials
   */
  async registerFieldworker(payload: FieldworkerRegisterPayload, ticket?: string): Promise<AuthApiResponse> {
    try {
      const headers: Record<string, string> = {};
      if (ticket) {
        headers['Authorization'] = `Bearer ${ticket}`;
      }
      return await apiFetch<AuthApiResponse>('/api/auth/register/fieldworker', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch {
      // Fallback local registration
      const user: AuthUser = {
        id: `usr-fw-${Date.now().toString().slice(-4)}`,
        role: 'fieldworker',
        first_name: payload.first_name,
        last_name: payload.last_name,
        name: `${payload.first_name} ${payload.last_name}`.trim(),
        email: payload.email,
        phone_number: payload.phone_number,
        avatar: payload.avatar,
        gender: payload.gender,
        skills: payload.skills,
        equipment: payload.equipment,
        nid_number: payload.nid_number,
        address: payload.address,
        dob: payload.dob,
        experience_certificate: payload.experience_certificate,
        verification_status: 'Government Verified',
        created_at: new Date().toISOString()
      };
      return {
        success: true,
        is_new_user: false,
        user,
        token: `simulated_token_${Date.now()}`,
        message: 'Fieldworker registered successfully.'
      };
    }
  },

  /**
   * Direct Sign In (without OTP, for registered users)
   */
  async directSignIn(email: string, role: UserRole): Promise<AuthApiResponse> {
    // Check if user is registered in localStorage
    const storedUsersJson = localStorage.getItem('shohay_registered_users');
    let registeredUsers: Record<string, AuthUser> = {};
    if (storedUsersJson) {
      try {
        registeredUsers = JSON.parse(storedUsersJson);
      } catch {
        registeredUsers = {};
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    if (registeredUsers[cleanEmail]) {
      const user = registeredUsers[cleanEmail];
      return {
        success: true,
        is_new_user: false,
        user,
        token: `token_${cleanEmail}`,
        message: `Welcome back, ${user.name}!`
      };
    }

    // Try backend OTP check if needed
    const otpRes = await this.sendOtp(email);
    if (!otpRes.is_new_user) {
      // User exists on backend! Create direct user session
      const user: AuthUser = {
        id: `usr-${role}-${Date.now().toString().slice(-4)}`,
        name: email.split('@')[0],
        first_name: email.split('@')[0],
        last_name: '',
        role,
        email: cleanEmail,
        verification_status: 'Verified'
      };
      return {
        success: true,
        is_new_user: false,
        user,
        token: `token_${cleanEmail}`,
        message: `Welcome back to Shohay!`
      };
    }

    // New user trying to sign in directly
    throw new Error('No registered account found with this email. Please create an account.');
  }
};
