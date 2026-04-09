import {NoopAdapter} from './adapters/NoopAdapter';
import type {ObservabilityClient, ObservabilityConfig} from './types';

/**
 * Create the provider-specific adapter for the configured runtime.
 * Provider implementations are imported lazily so unused SDKs stay out of the
 * initial bundle.
 * @param provider Provider identifier from runtime config.
 * @returns A concrete client implementation for the requested provider.
 */
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
