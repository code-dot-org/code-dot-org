import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';

import {DeferredAdapter} from './adapters/DeferredAdapter';
import {NoopAdapter} from './adapters/NoopAdapter';
import {createObservabilityClient} from './factory';
import type {
  LogAttributes,
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  SamplingConfig,
} from './types';

export type {
  LogAttributes,
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  SamplingConfig,
};
export {createObservabilityClient};

let observabilityClient: ObservabilityClient = new NoopAdapter();

export function _initializeSingleton(client: ObservabilityClient): void {
  observabilityClient = client;
}

export function init(config: ObservabilityConfig): void {
  observabilityClient.init(config);
}

export function recordError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  observabilityClient.recordError(error, context);
}

export function setConsented(userId: string | null): void {
  observabilityClient.setConsented(userId);
}

export function isConsented(): boolean {
  return observabilityClient.isConsented();
}

export function shutdown(): Promise<void> {
  return observabilityClient.shutdown();
}

export const logger: ObservabilityLogger = {
  trace: (message, attributes) =>
    observabilityClient.logger.trace(message, attributes),
  debug: (message, attributes) =>
    observabilityClient.logger.debug(message, attributes),
  info: (message, attributes) =>
    observabilityClient.logger.info(message, attributes),
  warn: (message, attributes) =>
    observabilityClient.logger.warn(message, attributes),
  error: (message, attributes) =>
    observabilityClient.logger.error(message, attributes),
  fatal: (message, attributes) =>
    observabilityClient.logger.fatal(message, attributes),
};

export const metrics: ObservabilityMetrics = {
  count: (name, value, attributes) =>
    observabilityClient.metrics.count(name, value, attributes),
  gauge: (name, value, attributes) =>
    observabilityClient.metrics.gauge(name, value, attributes),
  distribution: (name, value, attributes) =>
    observabilityClient.metrics.distribution(name, value, attributes),
};

/**
 * CorePlugin implementation for frontend observability.
 * Register at bootstrap via initializeCore({plugins: [observabilityPlugin]}).
 */
export const observabilityPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    const observability = config.observability as
      | ObservabilityConfig
      | undefined;

    if (!observability || observability.provider === 'none') {
      return;
    }

    const deferredClient = new DeferredAdapter();
    _initializeSingleton(deferredClient);

    void createObservabilityClient(observability.provider).then(client => {
      client.init(observability);
      deferredClient.flushTo(client);
      _initializeSingleton(client);
    });
  },
};
