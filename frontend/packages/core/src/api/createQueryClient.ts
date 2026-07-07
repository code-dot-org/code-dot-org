import {
  QueryCache,
  QueryClient,
  type QueryClientConfig,
} from '@tanstack/react-query';

import {recordError} from '../plugins/observability';

/**
 * QueryClient with Code.org's shared defaults. Exported so a host can own one
 * instance to both prime the cache (e.g. in a router beforeLoad) and provide it.
 */
export function createQueryClient(
  defaultOptions?: QueryClientConfig['defaultOptions'],
): QueryClient {
  return new QueryClient({
    // Surface every query failure. Without this a failed fetch — or a schema
    // (zod) parse error on a 200 response — only flips the query's `isError`
    // and is never reported, so a lab that renders its error page leaves no
    // trace of the reason. Recorded through the observability plugin (a no-op
    // until a provider is configured) with the query key identifying which
    // fetch failed; the console.error keeps the reason visible in development,
    // where no provider is configured.
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error(
          `[react-query] query failed: ${JSON.stringify(query.queryKey)}`,
          error,
        );
        recordError(error, {queryKey: query.queryKey});
      },
    }),
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
