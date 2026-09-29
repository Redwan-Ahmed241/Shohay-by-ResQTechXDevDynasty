/* ═══════════════════════════════════════════════════════════
   SHOHAY API Service Client — Real Backend & Fallback Layer
   ═══════════════════════════════════════════════════════════ */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://shohaybackend.vercel.app')
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

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      const errorText = await response.text().catch(() => '');
      if (errorText) errorDetail = errorText;
    }
    throw new Error(errorDetail || `API error ${response.status}`);
  }

  return response.json();
}
