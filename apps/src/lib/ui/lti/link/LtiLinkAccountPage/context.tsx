import {createContext} from 'react';
import {LtiProvider} from './types';

export interface LtiProviderContextProps {
  ltiProvider: LtiProvider;
  newAccountUrl: string;
  existingAccountUrl: string;
}

export const LtiProviderContext = createContext<
  LtiProviderContextProps | undefined
>(undefined);
