import {NoopAdapter} from './adapters/noop';
import {SentryAdapter} from './adapters/sentry';
import type {ObservabilityClient, ObservabilityConfig} from './types';

/**
 * Factory function that returns an ObservabilityClient for the given provider.
 *
 * - 'none' or undefined → NoopAdapter (no external calls)
 * - 'sentry' → SentryAdapter (SDK init deferred to adapter.init())
 * - anything else → throws a descriptive Error
 *
 * Requirements: 2.1, 2.2, 2.3
 */
export function createObservabilityClient(
  provider?: ObservabilityConfig['provider'],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: Omit<ObservabilityConfig, 'provider'>,
): ObservabilityClient {
  if (provider === undefined || provider === 'none') {
    return new NoopAdapter();
  }

  if (provider === 'sentry') {
    return new SentryAdapter();
  }

  throw new Error(`Unsupported observability provider: "${provider}"`);
}
