'use client';
import {ReactNode, useEffect, useState} from 'react';

import OneTrustContext, {
  OneTrustContextType,
  OneTrustCookieGroup,
  OneTrustCookieGroupSet,
} from '@/providers/onetrust/context/OneTrustContext';

/**
 * Provides OneTrust client-side contextual information sourced from the OneTrust SDK
 */
const OneTrustProvider = ({children}: {children: ReactNode}) => {
  const [oneTrustSettings, setOneTrustSettings] = useState<
    OneTrustContextType | undefined
  >(undefined);

  useEffect(() => {
    if (window.oneTrustPromise) {
      window.oneTrustPromise.then(oneTrust => {
        updateOneTrustSettings();

        oneTrust.OnConsentChanged(() => {
          updateOneTrustSettings();
        });
      });
    }
  }, []);

  const updateOneTrustSettings = () => {
    const activeGroupsString = window.OnetrustActiveGroups;

    if (typeof activeGroupsString !== 'string') {
      return;
    }

    const activeGroups = activeGroupsString.split(',');
    const allowedCookies = new Set<OneTrustCookieGroup>();

    for (const activeGroup of activeGroups) {
      const cookieGroup = OneTrustCookieGroupSet[activeGroup];

      if (cookieGroup) {
        allowedCookies.add(cookieGroup);
      }
    }

    setOneTrustSettings({allowedCookies});
  };

  return (
    <OneTrustContext.Provider value={oneTrustSettings}>
      {children}
    </OneTrustContext.Provider>
  );
};

export default OneTrustProvider;
