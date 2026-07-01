import {QueryClient, type QueryClientConfig} from '@tanstack/react-query';

/**
 * QueryClient with Code.org's shared defaults. Exported so a host can own one
 * instance to both prime the cache (e.g. in a router beforeLoad) and provide it.
 */
export function createQueryClient(
  defaultOptions?: QueryClientConfig['defaultOptions'],
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          const status = (error as {status?: number} | null)?.status;
          if (status === 401 || status === 403) return false;
          return failureCount < 2;
        },
        ...defaultOptions?.queries,
      },
      mutations: {
        retry: 0,
        ...defaultOptions?.mutations,
      },
      ...defaultOptions,
    },
  });
}
