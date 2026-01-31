import React, {Suspense, useMemo, useState} from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import type {QueryClientConfig} from '@tanstack/react-query';

// Lazily import the devtools only when needed/used
const ReactQueryDevtools = React.lazy(async () => {
  const mod = await import('@tanstack/react-query-devtools');
  return {default: mod.ReactQueryDevtools};
});

export type APIProviderProps = {
  children: React.ReactNode;

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

  /**
   * Whether to load and show React Query devtools.
   * Defaults to Vite's `import.meta.env.DEV` if available, otherwise false.
   */
  devtools?: boolean;

  /**
   * Props forwarded to ReactQueryDevtools (only used if devtools is enabled).
   */
  devtoolsProps?: Partial<React.ComponentProps<typeof ReactQueryDevtools>>;
};

function isViteDev(): boolean {
  // Vite provides import.meta.env.DEV in app builds; guard for tests/other runtimes.
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Boolean((import.meta as any)?.env?.DEV);
  } catch {
    return false;
  }
}

function createDefaultClient(
  defaultOptions?: APIProviderProps['defaultOptions'],
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

export default function APIProvider({
  children,
  client,
  defaultOptions,
  devtools,
  devtoolsProps,
}: APIProviderProps) {
  // Create exactly one QueryClient instance if the caller didn't provide one.
  const [ownedClient] = useState(() =>
    client ? null : createDefaultClient(defaultOptions),
  );

  const queryClient = client ?? ownedClient!;
  const showDevtools = devtools ?? isViteDev();

  const mergedDevtoolsProps = useMemo(() => {
    return {
      initialIsOpen: false,
      buttonPosition: 'bottom-left' as const,
      ...devtoolsProps,
    };
  }, [devtoolsProps]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {showDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools {...mergedDevtoolsProps} />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}
