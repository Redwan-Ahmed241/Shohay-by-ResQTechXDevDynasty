/* ═══════════════════════════════════════════════════════════
   SHOHAY API Service Client — Real Backend & Fallback Layer
   ═══════════════════════════════════════════════════════════ */

import { supabase } from './supabaseClient';

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

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** True when the backend could not be reached at all (offline, DNS, CORS) — not an HTTP error. */
export function isNetworkError(err: unknown): boolean {
  return !(err instanceof ApiError);
}

async function toApiError(response: Response): Promise<ApiError> {
  const text = await response.text().catch(() => '');
  let message = text || response.statusText;
  try {
    const body = JSON.parse(text);
    if (typeof body.detail === 'string') message = body.detail;
    else if (Array.isArray(body.detail) && body.detail[0]?.msg) message = body.detail[0].msg;
  } catch {
    // not JSON
  }
  return new ApiError(response.status, message);
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
    const response = await fetch(`${baseUrl}${cleanEndpoint}`, { ...options, headers });
    if (!response.ok) throw await toApiError(response);
    return (response.status === 204 ? undefined : await response.json()) as T;
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
