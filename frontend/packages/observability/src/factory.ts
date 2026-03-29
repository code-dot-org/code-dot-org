import {NoopAdapter} from './adapters/noop';
import type {ObservabilityClient, ObservabilityConfig} from './types';

/**
 * Factory function that returns an ObservabilityClient for the given provider.
 *
 * - 'none' or undefined → NoopAdapter synchronously (no dynamic import needed)
 * - 'sentry' → dynamically imports SentryAdapter so @sentry/browser lands in a
 *   separate async bundle chunk and is only fetched when actually needed
 * - anything else → throws a descriptive Error
 *
 * The factory is async so that the SentryAdapter (and @sentry/browser) can be
 * code-split at the adapter level. Callers that only ever use 'none' pay no
 * bundle cost for the Sentry SDK.
 *
 * Requirements: 2.1, 2.2, 2.3, 6.5, 6.7
 */
export async function createObservabilityClient(
  provider?: ObservabilityConfig['provider'],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _config?: Omit<ObservabilityConfig, 'provider'>,
): Promise<ObservabilityClient> {
  if (provider === undefined || provider === 'none') {
    return new NoopAdapter();
  }

  if (provider === 'sentry') {
    const {SentryAdapter} = await import('./adapters/sentry');
    return new SentryAdapter();
  }

  throw new Error(`Unsupported observability provider: "${provider}"`);
}
