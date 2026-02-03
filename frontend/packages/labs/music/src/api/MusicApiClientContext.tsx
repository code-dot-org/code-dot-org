import type {PropsWithChildren} from 'react';
import {createContext, useContext} from 'react';

import type {MusicApiClient} from './client';

export const MusicApiClientContext = createContext<MusicApiClient | null>(null);

export interface MusicApiClientProviderProps extends PropsWithChildren {
  client: MusicApiClient;
}

export function MusicApiClientProvider({
  client,
  children,
}: MusicApiClientProviderProps) {
  return (
    <MusicApiClientContext.Provider value={client}>
      {children}
    </MusicApiClientContext.Provider>
  );
}

export function useMusicApiClient(): MusicApiClient {
  const client = useContext(MusicApiClientContext);
  if (!client) {
    throw new Error(
      'useMusicApiClient must be used within <MusicApiClientProvider>',
    );
  }
  return client;
}
