import {NoopAdapter} from './adapters/NoopAdapter';
import type {AnalyticsClient, AnalyticsConfig} from './types';

/**
 * Create the adapter for the configured provider. Each provider's SDK is
 * dynamic-imported so unused ones stay out of the initial bundle.
 */
export async function createAnalyticsClient(
  provider?: AnalyticsConfig['provider'],
): Promise<AnalyticsClient> {
  if (provider === undefined || provider === 'none') {
    return new NoopAdapter();
  }
  if (provider === 'statsig') {
    const {StatsigAdapter} = await import('./adapters/StatsigAdapter');
    return new StatsigAdapter();
  }
  throw new Error(`Unsupported analytics provider: "${provider}"`);
}
