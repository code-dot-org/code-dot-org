import type {PropsWithChildren} from 'react';

import type {ApiClient} from '../client/createApiClient';

import {ApiClientContext} from './ApiClientContext';

export interface ApiClientProviderProps extends PropsWithChildren {
  client: ApiClient;
}

const ApiClientProvider = ({client, children}: ApiClientProviderProps) => (
  <ApiClientContext.Provider value={client}>
    {children}
  </ApiClientContext.Provider>
);

export default ApiClientProvider;
