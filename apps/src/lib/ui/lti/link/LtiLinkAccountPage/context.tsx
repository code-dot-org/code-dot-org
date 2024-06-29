import {createContext} from 'react';
import {LtiProvider} from './types';

export interface LtiProviderContextProps {
  ltiProvider: LtiProvider;
  ltiProviderName: string;
  newAccountUrl: string;
  continueAccountUrl: string;
  existingAccountUrl: URL;
  emailAddress: string;
  newCtaType: 'continue' | 'new';
}

export const LtiProviderContext = createContext<
  LtiProviderContextProps | undefined
>(undefined);
