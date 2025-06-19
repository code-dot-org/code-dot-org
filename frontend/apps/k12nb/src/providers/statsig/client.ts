import {useClientBootstrapInit} from '@statsig/react-bindings';
import {setCookie} from 'cookies-next';
import {getCookie} from 'cookies-next/client';
import {useContext} from 'react';
import {v4 as uuidv4} from 'uuid';

import {Stage} from '@/config/stage';
import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';
import plugins from '@/providers/statsig/plugins';

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
    });
  }

  return stableId;
}

export function getClient(clientKey: string, stage: Stage, values: string) {
  return useClientBootstrapInit(
    clientKey,
    {userID: 'marketing-user', customIDs: {stableID: getStatsigStableId()}},
    values,
    {
      environment: {tier: stage},
      plugins: plugins,
    },
  );
}
