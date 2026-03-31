import {NoopAdapter} from './adapters/NoopAdapter';
import type {ObservabilityClient, ObservabilityConfig} from './types';

export async function createObservabilityClient(
  provider?: ObservabilityConfig['provider'],
): Promise<ObservabilityClient> {
  if (provider === undefined || provider === 'none') {
    return new NoopAdapter();
  }

  if (provider === 'sentry') {
    const {SentryAdapter} = await import('./adapters/SentryAdapter');
    return new SentryAdapter();
  }

  throw new Error(`Unsupported observability provider: "${provider}"`);
}
