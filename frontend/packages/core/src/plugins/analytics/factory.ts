import {ConsoleAdapter} from './adapters/ConsoleAdapter';
import type {AnalyticsClient} from './types';

/** Which client to boot. `console` is a local-development choice, not a config value. */
export type AnalyticsClientKind = 'statsig' | 'console';

/** Creates the requested client, importing a provider SDK lazily. */
export async function createAnalyticsClient(
  kind: AnalyticsClientKind,
): Promise<AnalyticsClient> {
  if (kind === 'console') {
    return new ConsoleAdapter();
  }

  if (kind === 'statsig') {
    const {StatsigAdapter} = await import('./adapters/StatsigAdapter');
    return new StatsigAdapter();
  }

  throw new Error(`Unsupported analytics client: "${kind}"`);
}
