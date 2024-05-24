import {createContext} from 'react';
import {LtiProvider} from './types';

export interface LtiProviderContextProps {
  ltiProvider: LtiProvider;
  ltiProviderName: string;
  newAccountUrl: string;
  existingAccountUrl: URL;
  emailAddress: string;
}

export const LtiProviderContext = createContext<
  LtiProviderContextProps | undefined
>(undefined);
