import {
  QueryClient,
  QueryClientProvider as QueryClientProviderBase,
} from '@tanstack/react-query';
import type {QueryClientConfig} from '@tanstack/react-query';
import {useState, type PropsWithChildren} from 'react';

import {createQueryClient} from './createQueryClient';

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

export default function QueryClientProvider({
  children,
  client,
  defaultOptions,
}: QueryClientProviderProps) {
  // Create exactly one QueryClient instance if the caller didn't provide one.
  const [ownedClient] = useState(() =>
    client ? null : createQueryClient(defaultOptions),
  );

  const queryClient = client ?? ownedClient!;

  return (
    <QueryClientProviderBase client={queryClient}>
      {children}
    </QueryClientProviderBase>
  );
}
