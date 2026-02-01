import {useState, type PropsWithChildren} from 'react';
import {
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from '@tanstack/react-query';
import type {QueryClientConfig} from '@tanstack/react-query';

export interface QueryClientProviderProps extends PropsWithChildren {
  /**
   * Optional pre-created QueryClient (useful for tests).
   * If omitted, APIProvider will create and own one.
   */
  client?: QueryClient;

  /**
   * Override default QueryClient options when APIProvider creates the client.
   * Ignored if `client` is provided.
   */
  defaultOptions?: QueryClientConfig['defaultOptions'];
}

function createDefaultClient(
  defaultOptions?: QueryClientProviderProps['defaultOptions'],
): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // App-friendly defaults; tweak per your needs.
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

export default function QueryClientProvider({
  children,
  client,
  defaultOptions,
}: QueryClientProviderProps) {
  // Create exactly one QueryClient instance if the caller didn't provide one.
  const [ownedClient] = useState(() =>
    client ? null : createDefaultClient(defaultOptions),
  );

  const queryClient = client ?? ownedClient!;

  return (
    <QueryClientProviderBase client={queryClient}>
      {children}
    </QueryClientProviderBase>
  );
}
