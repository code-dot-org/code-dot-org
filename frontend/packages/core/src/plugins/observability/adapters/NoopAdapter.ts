import type {ObservabilityConfig} from '../types';

import {BaseAdapter} from './BaseAdapter';

/**
 * Fallback adapter used when observability is disabled or unavailable.
 */
export class NoopAdapter extends BaseAdapter {
  /**
   * No-op adapter ignores provider configuration entirely.
   * @param config Normalized runtime configuration.
   */
  protected initProvider(config: ObservabilityConfig): void {
    void config;
  }

  /**
   * No-op adapter intentionally drops all errors.
   * @param error The thrown value or exception-like object to record.
   * @param context Optional structured metadata to attach to the error event.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void {
    void error;
    void context;
  }

  /**
   * No-op adapter has no resources to release.
   * @returns A resolved promise.
   */
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
