/* ═══════════════════════════════════════════════════════════
   SHOHAY API Service Client — Real Backend & Fallback Layer
   ═══════════════════════════════════════════════════════════ */

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'https://shohaybackend.vercel.app'
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
    const errorText = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}: ${errorText || response.statusText}`);
  }

  return response.json();
}
