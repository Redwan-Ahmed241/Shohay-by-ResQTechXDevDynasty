/* ═══════════════════════════════════════════════════════════
   SHOHAY API Service Client — Real Backend & Fallback Layer
   ═══════════════════════════════════════════════════════════ */

import { supabase } from './supabaseClient';
import {
  logErrorDetails,
  sanitizeErrorMessage,
  getSafeErrorText
} from '../utils/errorSanitizer';

// Export safe error text utility for consistent use across components
export const errorText = getSafeErrorText;

// Automatically prefer local backend port 8000 in development if running locally, otherwise Vercel
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const PRODUCTION_API = 'https://shohaybackend.vercel.app';

const DEFAULT_BASE_URL = isLocalhost ? 'http://127.0.0.1:8000' : PRODUCTION_API;

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
).replace(/\/+$/, '');

const MOCK_DELAY = 150; // Simulated latency for fallback

export async function mockFetch<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
}

/** The server answered with an error (401 sign in, 403 not allowed, 409 conflict, ...). */
export class ApiError extends Error {
  readonly status: number;
  readonly rawMessage: string;

  constructor(status: number, message: string, rawMessage?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.rawMessage = rawMessage || message;
  }
}

/** True when the backend could not be reached at all (offline, DNS, CORS) — not an HTTP error. */
export function isNetworkError(err: unknown): boolean {
  return !(err instanceof ApiError);
}

async function toApiError(response: Response, endpoint: string): Promise<ApiError> {
  const text = await response.text().catch(() => '');
  let rawMessage = text || response.statusText;
  try {
    const body = JSON.parse(text);
    if (typeof body.detail === 'string') rawMessage = body.detail;
    else if (Array.isArray(body.detail) && body.detail[0]?.msg) rawMessage = body.detail[0].msg;
    else if (typeof body.message === 'string') rawMessage = body.message;
  } catch {
    // not JSON
  }

  // Always log full unsanitized details for developer/server debugging
  logErrorDetails(`API ${response.status} from ${endpoint}`, rawMessage, {
    status: response.status,
    statusText: response.statusText,
    endpoint,
    rawBody: text
  });

  // Never expose stack traces, database internals, or file paths to users
  const sanitizedMessage = sanitizeErrorMessage(rawMessage, response.status);
  return new ApiError(response.status, sanitizedMessage, rawMessage);
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Attach the Supabase access token (getSession refreshes it when it has expired)
  let authHeader: Record<string, string> = {};
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      authHeader = { Authorization: `Bearer ${data.session.access_token}` };
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...(options?.headers || {})
  };

  const send = async (baseUrl: string): Promise<T> => {
    const url = `${baseUrl}${cleanEndpoint}`;
    try {
      const response = await fetch(url, { ...options, headers });
      if (!response.ok) throw await toApiError(response, cleanEndpoint);
      return (response.status === 204 ? undefined : await response.json()) as T;
    } catch (error) {
      if (isNetworkError(error)) {
        logErrorDetails(`Network fetch failed for ${url}`, error);
      }
      throw error;
    }
  };

  try {
    return await send(API_BASE_URL);
  } catch (error) {
    // Only when a local backend is not running at all, try the production backend instead.
    if (isNetworkError(error) && API_BASE_URL !== PRODUCTION_API) {
      try {
        return await send(PRODUCTION_API);
      } catch {
        // fall through to the original error
      }
    }
    throw error;
  }
}
