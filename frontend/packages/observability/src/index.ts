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
export let singleton: ObservabilityClient = new NoopAdapter();

/**
 * Reassign the singleton to the provided client.
 * Called only by observabilityPlugin after init.
 * @internal
 */
export function _initializeSingleton(client: ObservabilityClient): void {
  singleton = client;
}

export default singleton;
