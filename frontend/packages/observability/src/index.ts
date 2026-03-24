export type {RumClient, RumClientConfig, RumProvider} from './types';

import {DatadogAdapter} from './adapters/datadog';
import {NewRelicAdapter} from './adapters/newrelic';
import {NoOpAdapter} from './adapters/noop';
import {SentryAdapter} from './adapters/sentry';
import type {RumClient, RumProvider} from './types';

/**
 * Factory function that returns the appropriate RumClient adapter for the given provider.
 *
 * @param provider - The RUM provider identifier
 * @returns A RumClient instance for the given provider
 * @throws Error if the provider is not recognized
 */
export function createRumClient(provider: RumProvider): RumClient {
  switch (provider) {
    case 'none':
      return new NoOpAdapter();
    case 'datadog':
      return new DatadogAdapter();
    case 'newrelic':
      return new NewRelicAdapter();
    case 'sentry':
      return new SentryAdapter();
    default: {
      const _exhaustive: never = provider;
      throw new Error(
        `Unsupported RUM provider: "${String(_exhaustive)}". ` +
          'Valid values are: newrelic, datadog, sentry, none.'
      );
    }
  }
}
