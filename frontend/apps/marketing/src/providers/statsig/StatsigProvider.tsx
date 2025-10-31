'use client';

import {StatsigProvider as BaseStatsigProvider} from '@statsig/react-bindings';
import {ReactNode} from 'react';

import {Stage} from '@/config/stage';
import {getClient} from '@/providers/statsig/client';

interface StatsigProviderProps {
  stage: Stage;
  clientKey?: string;
  children: ReactNode;
  values: string;
  brand: string;
}

export default function StatsigProvider({
  stage,
  clientKey,
  values,
  children,
  brand,
}: StatsigProviderProps) {
  if (!clientKey) {
    console.debug(
      `[Statsig] Missing environment variable STATSIG_CLIENT_KEY. Statsig will not be enabled.`,
    );
    return children;
  }

  const client = getClient(clientKey, stage, values, brand);

  return <BaseStatsigProvider client={client}>{children}</BaseStatsigProvider>;
}
