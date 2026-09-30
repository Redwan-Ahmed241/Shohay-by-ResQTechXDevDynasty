import { QueryClient } from '@tanstack/react-query';

// Cached data is reused for 30s before a background refetch — short enough that
// operational data never feels stale, long enough that clicking to another page
// and back doesn't refire the same request.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1
    }
  }
});
