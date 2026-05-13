import {createContext} from 'react';

import {LtiProvider} from './types';

export interface LtiProviderContextProps {
  ltiProvider: LtiProvider;
  ltiProviderName: string;
  newAccountUrl: URL;
  continueAccountUrl: string;
  existingAccountUrl: URL;
  emailAddress: string;
  newCtaType: 'continue' | 'new';
  userType: string;
  finishSignUpUrl: string;
}

export const LtiProviderContext = createContext<
  LtiProviderContextProps | undefined
>(undefined);
