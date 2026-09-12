/* ═══════════════════════════════════════════════════════════
   SHOHAY API Service Client — Real Backend & Fallback Layer
   ═══════════════════════════════════════════════════════════ */

export const TOKEN_STORAGE_KEY = 'shohay_auth_token';

// Automatically prefer local backend port 8000 in development if running locally, otherwise Vercel
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const DEFAULT_BASE_URL = isLocalhost
  ? 'http://127.0.0.1:8000'
  : 'https://shohaybackend.vercel.app';

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
).replace(/\/+$/, '');

const MOCK_DELAY = 150; // Simulated latency for fallback

export async function mockFetch<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
}

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  // Attach persistent bearer token if present
  let authHeader: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      authHeader = { Authorization: `Bearer ${token}` };
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...(options?.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`API error ${response.status}: ${errorText || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    // If local backend is down, try Vercel backend as fallback
    if (API_BASE_URL !== 'https://shohaybackend.vercel.app' && !url.includes('shohaybackend.vercel.app')) {
      const fallbackUrl = `https://shohaybackend.vercel.app${cleanEndpoint}`;
      try {
        const fbResponse = await fetch(fallbackUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader,
            ...(options?.headers || {})
          },
          ...options
        });
        if (fbResponse.ok) {
          return fbResponse.json();
        }
      } catch {
        // Fall through to throw original error
      }
    }
    throw error;
  }
}
