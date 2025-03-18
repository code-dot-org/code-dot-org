import {useClientBootstrapInit} from '@statsig/react-bindings';

import {Stage} from '@/config/stage';
import plugins from '@/providers/statsig/plugins';

export function getClient(clientKey: string, stage: Stage, values: string) {
  return useClientBootstrapInit(clientKey, {userID: 'marketing-user'}, values, {
    environment: {tier: stage},
    plugins: plugins,
  });
}
