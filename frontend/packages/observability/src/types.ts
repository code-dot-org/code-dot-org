export type RumProvider = 'newrelic' | 'datadog' | 'sentry' | 'none';

export interface RumClientConfig {
  /** Application name reported to the provider */
  applicationName: string;
  /** Environment tag (e.g. 'production', 'staging') */
  environment: string;
  /** Application version / release string */
  version?: string;
  /** Provider-specific options passed through verbatim */
  providerOptions?: Record<string, unknown>;
}

/**
 * Common interface implemented by every Provider Adapter.
 * All methods are synchronous from the caller's perspective;
 * any async provider calls are fire-and-forget inside the adapter.
 */
export interface RumClient {
  /**
   * Initialize the RUM provider. Must be called once, in a browser
   * environment, before any other method. Safe to call multiple times
   * (subsequent calls are no-ops).
   */
  init(config: RumClientConfig): void;

  /**
   * Forward a structured log entry to the active RUM provider.
   */
  recordLog(
    level: 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void;

  /**
   * Forward a named numeric metric to the active RUM provider.
   */
  recordMetric(
    name: string,
    value: number,
    options?: {unit?: string; dimensions?: Record<string, string>}
  ): void;

  /**
   * Convenience wrapper: calls recordMetric with value 1 and unit 'count'.
   */
  incrementCounter(name: string, dimensions?: Record<string, string>): void;

  /**
   * Flush pending events and tear down the provider SDK.
   * Called on application unload.
   */
  shutdown(): void;
}
