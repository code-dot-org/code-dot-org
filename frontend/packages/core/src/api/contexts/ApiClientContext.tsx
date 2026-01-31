import type {PropsWithChildren} from 'react';
import {createContext, useContext} from 'react';

import type {ApiClient} from '../client/createApiClient';

export const ApiClientContext = createContext<ApiClient | null>(null);

export interface ApiClientProviderProps extends PropsWithChildren {
  client: ApiClient;
}

export function ApiClientProvider({client, children}: ApiClientProviderProps) {
  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within <ApiClientProvider>');
  }
  return client;
}
