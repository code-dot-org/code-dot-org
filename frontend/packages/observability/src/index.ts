import {NoopAdapter} from './adapters/noop';
import type {
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  LogAttributes,
  SamplingConfig,
} from './types';

export type {
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  LogAttributes,
  SamplingConfig,
};
export {createObservabilityClient} from './factory';

/**
 * Module-level singleton — starts as no-op, reassigned by _initializeSingleton.
 * ES module consumers hold a live binding so reassignment is visible to all importers.
 * Requirements: 1.1, 1.4, 2.5
 */
export let observabilityClient: ObservabilityClient = new NoopAdapter();

/**
 * Reassign the singleton to the provided client.
 * Called only by observabilityPlugin after init.
 * @internal
 */
export function _initializeSingleton(client: ObservabilityClient): void {
  observabilityClient = client;
}

// ─── Module-level API — mirrors ObservabilityClient, delegates to live singleton ──
//
// Consumers can use either:
//   import * as observability from '@code-dot-org/observability'
//   observability.logger.info('...')
//
// or the named export:
//   import {observabilityClient} from '@code-dot-org/observability'

/** @see ObservabilityClient.init */
export function init(config: ObservabilityConfig): void {
  observabilityClient.init(config);
}

/** @see ObservabilityClient.recordError */
export function recordError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  observabilityClient.recordError(error, context);
}

/** @see ObservabilityClient.setConsented */
export function setConsented(userId: string | null): void {
  observabilityClient.setConsented(userId);
}

/** @see ObservabilityClient.isConsented */
export function isConsented(): boolean {
  return observabilityClient.isConsented();
}

/** @see ObservabilityClient.shutdown */
export function shutdown(): Promise<void> {
  return observabilityClient.shutdown();
}

/**
 * Structured logger — delegates to the live singleton's logger.
 * Each property access goes through the singleton so it reflects the
 * adapter installed by _initializeSingleton.
 * @see ObservabilityClient.logger
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
 * Metrics instruments — delegates to the live singleton's metrics.
 * @see ObservabilityClient.metrics
 */
export const metrics: ObservabilityMetrics = {
  count: (name, value, attributes) =>
    observabilityClient.metrics.count(name, value, attributes),
  gauge: (name, value, attributes) =>
    observabilityClient.metrics.gauge(name, value, attributes),
  distribution: (name, value, attributes) =>
    observabilityClient.metrics.distribution(name, value, attributes),
};
