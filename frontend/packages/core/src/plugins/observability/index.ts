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
  TagValue,
} from './types';

export type {
  LogAttributes,
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  SamplingConfig,
  TagValue,
  SpanOptions,
};
export {createObservabilityClient};

/**
 * Module-level singleton used by the public logger/metrics/error helpers.
 */
let observabilityClient: ObservabilityClient = new NoopAdapter();

/**
 * Test hook and bootstrap helper for swapping the active client implementation.
 * @param client Client instance to install as the active singleton.
 */
export function _initializeSingleton(client: ObservabilityClient): void {
  observabilityClient = client;
}

/**
 * Directly initialize the currently installed client.
 * Most consumers should prefer `observabilityPlugin` instead of calling this.
 * @param config Normalized runtime configuration for the active provider.
 */
export function init(config: ObservabilityConfig): void {
  observabilityClient.init(config);
}

/**
 * Record an exception through the active provider, if any.
 * @param error The thrown value or exception-like object to record.
 * @param context Optional structured metadata to attach to the error event.
 */
export function recordError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  observabilityClient.recordError(error, context);
}

/**
 * Run callback inside a provider span. No-ops when observability is not
 * configured; otherwise delegates to the active provider implementation.
 * @param options Span name, operation, and attributes.
 * @param callback Work to perform inside the span.
 */
export function startSpan<T>(
  options: import('./types').SpanOptions,
  callback: () => T,
): T {
  return observabilityClient.startSpan(options, callback);
}

/**
 * Update provider consent state for the current signed-in user.
 * @param userId Signed-in user id, or `null` when consent is revoked.
 */
export function setConsented(userId: string | null): void {
  observabilityClient.setConsented(userId);
}

/**
 * Report whether consent has been granted on the active client.
 * @returns `true` when consent is currently recorded on the active client.
 */
export function isConsented(): boolean {
  return observabilityClient.isConsented();
}

/**
 * Set or replace a session-scoped tag on subsequent provider events.
 * Tags are low-cardinality, indexed dimensions; reserve them for values
 * useful as a filter (e.g. `appType`, `locale`).
 * @param key Tag name.
 * @param value Primitive tag value.
 */
export function setTag(key: string, value: TagValue): void {
  observabilityClient.setTag(key, value);
}

/**
 * Attach a structured context blob to subsequent provider events. Contexts
 * are not indexed and are sized for high-cardinality or per-request data
 * (e.g. project channel id, level metadata). Pass `null` to clear.
 * @param name Context name.
 * @param ctx Structured context object, or `null` to clear.
 */
export function setContext(
  name: string,
  ctx: Record<string, unknown> | null,
): void {
  observabilityClient.setContext(name, ctx);
}

/**
 * Flush and shut down the active provider client.
 * @returns A promise that resolves once the provider has completed shutdown.
 */
export function shutdown(): Promise<void> {
  return observabilityClient.shutdown();
}

/**
 * Provider-agnostic logger surface that always points at the current client.
 */
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

/**
 * Provider-agnostic metrics surface that always points at the current client.
 */
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
  /**
   * Install the observability client for the current runtime configuration.
   * @param config Site config populated during core bootstrap.
   */
  onCoreReady(config: SiteConfig & SiteConfigExtensions) {
    const observability = config.observability as
      | ObservabilityConfig
      | undefined;

    if (!observability || observability.provider === 'none') {
      return;
    }

    const deferredClient = new DeferredAdapter();
    _initializeSingleton(deferredClient);

    // Provider code loads asynchronously, so we buffer startup-time calls until
    // the real client is ready and then replay them in order.
    void createObservabilityClient(observability.provider)
      .then(client => {
        client.init(observability);
        deferredClient.flushTo(client);
        _initializeSingleton(client);
      })
      .catch(error => {
        console.warn(
          '[observability] failed to create provider client; falling back to no-op client:',
          error,
        );
        const noopClient = new NoopAdapter();
        deferredClient.flushTo(noopClient);
        _initializeSingleton(noopClient);
      });
  },
};
