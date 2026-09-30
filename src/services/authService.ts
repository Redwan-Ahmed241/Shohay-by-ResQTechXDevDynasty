/* ═══════════════════════════════════════════════════════════
   SHOHAY Authentication Service — Supabase Auth one-time codes
   ═══════════════════════════════════════════════════════════ */

import type { AuthError, SupabaseClient } from '@supabase/supabase-js';
import { apiFetch } from './api';
import { supabase } from './supabaseClient';
import { AuthUser, UserRole } from '../types';
import { logErrorDetails, sanitizeErrorMessage } from '../utils/errorSanitizer';
import {
  emailSchema,
  bdPhoneSchema,
  otpCodeSchema,
  volunteerSignupSchema,
  assertValid
} from '../utils/validationSchemas';

export type AuthMethod = 'email' | 'mobile';

/**
 * Profile hints saved on the Supabase user when the account is first created.
 * The backend reads them once, when it creates the matching users row; the role
 * itself is always decided by the backend.
 */
export interface SignUpMetadata {
  requested_role?: 'public' | 'fieldworker';
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface VolunteerSignupData {
  firstName: string;
  lastName: string;
  mobile?: string;
  district?: string;
  skills: string[];
  equipment: string[];
}

interface BackendUser {
  id: string;
  role: string;
  first_name: string;
  last_name: string;
  name?: string;
  phone_number?: string | null;
  email?: string | null;
  avatar?: string | null;
  skills?: string[];
  equipment?: string[];
  verification_status?: string;
}

export function normalizeUserRole(backendRole: string): UserRole {
  const r = (backendRole || '').toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'volunteer' || r === 'fieldworker') return 'volunteer';
  return 'public';
}

export function transformBackendUser(u: BackendUser): AuthUser {
  const role = normalizeUserRole(u.role);
  const fullName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User';
  return {
    id: u.id,
    name: fullName,
    role,
    phone: u.phone_number || undefined,
    email: u.email || undefined
  };
}

/** Bangladeshi mobile number in the E.164 format Supabase expects (+8801XXXXXXXXX). */
export function toE164(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.startsWith('880')) return `+${digits}`;
  if (digits.startsWith('0')) return `+88${digits}`;
  return `+880${digits}`;
}

const FRIENDLY_ERRORS: Record<string, string> = {
  otp_expired: 'That code is wrong or has expired. Request a new one.',
  phone_provider_disabled: "SMS sign-in isn't enabled yet. Please sign in with your email address.",
  sms_send_failed: "We couldn't send the SMS. Please try again or use your email address.",
  email_address_not_authorized: "Sign-in emails can't be delivered to this address yet. Please try again later.",
  over_email_send_rate_limit: 'Too many codes requested. Please wait a few minutes and try again.',
  over_sms_send_rate_limit: 'Too many codes requested. Please wait a few minutes and try again.',
  email_address_invalid: 'Please enter a valid email address.'
};

function friendlyError(error: AuthError): Error {
  logErrorDetails('Supabase Auth Error', error, { code: error.code, status: error.status });
  if (error.code && FRIENDLY_ERRORS[error.code]) {
    return new Error(FRIENDLY_ERRORS[error.code]);
  }
  const sanitized = sanitizeErrorMessage(error.message, error.status, 'Authentication failed. Please check your credentials and try again.');
  return new Error(sanitized);
}

function client(): SupabaseClient {
  if (!supabase) {
    logErrorDetails('Supabase Client Missing', 'Supabase client is not initialized due to missing environment variables.');
    throw new Error('Sign-in is temporarily unavailable. Please try again later or contact support.');
  }
  return supabase;
}

export const authService = {
  /**
   * Sends a one-time code by email (the email also carries a sign-in link) or SMS.
   * Strictly validates identifier format against schema.
   */
  async sendCode(method: AuthMethod, identifier: string, metadata: SignUpMetadata = {}): Promise<void> {
    const validIdentifier =
      method === 'email'
        ? assertValid(emailSchema, identifier).toLowerCase()
        : assertValid(bdPhoneSchema, identifier);

    const { error } =
      method === 'email'
        ? await client().auth.signInWithOtp({
          email: validIdentifier,
          options: { data: metadata, emailRedirectTo: `${window.location.origin}/sign-in` }
        })
        : await client().auth.signInWithOtp({
          phone: toE164(validIdentifier),
          options: { data: metadata }
        });
    if (error) throw friendlyError(error);
  },

  /** Exchanges the one-time code for a Supabase session after validating code schema. */
  async verifyCode(method: AuthMethod, identifier: string, code: string): Promise<void> {
    const validCode = assertValid(otpCodeSchema, code);
    const validIdentifier =
      method === 'email'
        ? assertValid(emailSchema, identifier).toLowerCase()
        : assertValid(bdPhoneSchema, identifier);

    const token = validCode.replace(/\s/g, '');
    const { error } =
      method === 'email'
        ? await client().auth.verifyOtp({ email: validIdentifier, token, type: 'email' })
        : await client().auth.verifyOtp({ phone: toE164(validIdentifier), token, type: 'sms' });
    if (error) throw friendlyError(error);
  },

  /** Backend profile for the current Supabase session (created on first sign-in). */
  async getMe(): Promise<AuthUser> {
    const u = await apiFetch<BackendUser>('/api/auth/me');
    return transformBackendUser(u);
  },

  /** Saves volunteer details for the signed-in user after validating volunteerSignupSchema. */
  async registerVolunteer(data: VolunteerSignupData): Promise<AuthUser> {
    const validData = assertValid(volunteerSignupSchema, data);
    const u = await apiFetch<BackendUser>('/api/auth/register/volunteer', {
      method: 'POST',
      body: JSON.stringify({
        first_name: validData.firstName,
        last_name: validData.lastName,
        phone_number: validData.mobile || null,
        district: validData.district || null,
        skills: validData.skills,
        equipment: validData.equipment
      })
    });
    return transformBackendUser(u);
  },

  async signOut(): Promise<void> {
    if (supabase) await supabase.auth.signOut();
  }
};
