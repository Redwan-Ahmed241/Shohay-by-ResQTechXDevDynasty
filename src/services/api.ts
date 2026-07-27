/* ═══════════════════════════════════════════════════════════
   SHOHOY API Service Client — Mock / Real Layer
   ═══════════════════════════════════════════════════════════ */

const MOCK_DELAY = 150; // Simulate network latency in ms

export async function mockFetch<T>(data: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), MOCK_DELAY);
  });
}
