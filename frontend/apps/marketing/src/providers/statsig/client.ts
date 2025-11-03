import {
  useStatsigClient,
  useClientBootstrapInit,
  StatsigUser,
} from '@statsig/react-bindings';
import {setCookie} from 'cookies-next';
import {getCookie} from 'cookies-next/client';
import {useContext} from 'react';
import {v4 as uuidv4} from 'uuid';

import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

const CODEORG_BRAND = 'codeorg';

function getStatsigStableId() {
  const onetrustContext = useContext(OneTrustContext);

  if (!onetrustContext?.allowedCookies.has(OneTrustCookieGroup.Performance)) {
    // If the user has not allowed performance cookies, we do not set a stable ID
    return undefined;
  }

  let stableId = getCookie('statsig_stable_id');

  if (!stableId) {
    stableId = uuidv4();
    setCookie('statsig_stable_id', stableId, {
      path: '/',
      domain: '.code.org',
      sameSite: 'lax',
      secure: true,
    });
  }

  return stableId;
}

export function getClient(
  clientKey: string,
  stage: Stage,
  values: string,
  brand: string,
) {
  // Add stableID only for code.org brand so we can track users across
  // studio.code.org and code.org, otherwise fallback to Statsig SDK's default behavior
  const stableId = brand === CODEORG_BRAND ? getStatsigStableId() : undefined;
  const user: StatsigUser = stableId
    ? {userID: 'marketing-user', customIDs: {stableID: stableId}}
    : {userID: 'marketing-user'};

  return useClientBootstrapInit(clientKey, user, values, {
    environment: {tier: stage},
    plugins: stage === 'production' ? plugins : undefined,
  });
}

// Log events in Statsig
export function useStatsigLogger() {
  const {client} = useStatsigClient();

  const logEvent = (
    eventName: string,
    value: string,
    metadata?: Record<string, string>,
  ) => {
    try {
      if (client) {
        client.logEvent(eventName, value, metadata);
      } else {
        console.debug(
          'Statsig client not available, skipping event:',
          eventName,
        );
      }
    } catch (error) {
      console.warn('Failed to log Statsig event:', error);
    }
  };

  return {logEvent};
}
