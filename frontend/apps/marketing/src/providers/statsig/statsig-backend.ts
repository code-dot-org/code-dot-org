import {StatsigUser} from '@statsig/statsig-node-core';

import statsig from '@/providers/statsig/statsig';

const statsigInitializer = statsig ? statsig.initialize() : undefined;

export async function generateBootstrapValues(): Promise<string> {
  if (!statsig) {
    console.debug(
      `Missing environment variable STATSIG_SERVER_KEY, Statsig bootstrap will not be provided.`,
    );
    return Promise.resolve('');
  }

  const user = new StatsigUser({userID: 'marketing-user', customIDs: {}});
  await statsigInitializer;

  return statsig.getClientInitializeResponse(user, {
    hashAlgorithm: 'djb2',
  }) as string;
}
