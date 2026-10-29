import {createContext, useContext} from 'react';

import type {ApiClient} from '../client/createApiClient';

export const ApiClientContext = createContext<ApiClient | null>(null);

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within <ApiClientProvider>');
  }
  return client;
}
