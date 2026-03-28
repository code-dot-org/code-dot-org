/**
 * Sampling configuration for the observability provider.
 */
export interface SamplingConfig {
  /** Fraction of errors sent to the provider. Range [0, 1]. Default: 1.0 */
  errorSampleRate?: number;
  /** Fraction of traces/spans sent to the provider. Range [0, 1]. Default: 0 (disabled) */
  tracesSampleRate?: number;
  /** Fraction of log events sent to the provider. Range [0, 1]. Default: 0 (disabled) */
  logSampleRate?: number;
  /** Fraction of metric events sent to the provider. Range [0, 1]. Default: 0 (disabled) */
  metricsSampleRate?: number;
}

/**
 * Configuration for the observability package.
 */
export interface ObservabilityConfig {
  /** Provider identifier. Defaults to 'none'. */
  provider: 'sentry' | 'none';
  /** Sentry-specific configuration. Required when provider is 'sentry'. */
  sentry?: {
    dsn: string;
  };
  /** Sampling rates. Provider SDK defaults apply when not set. */
  sampling?: SamplingConfig;
  /**
   * URLs/patterns that should receive W3C traceparent headers.
   * Defaults to same-origin only when not set.
   */
  tracePropagationTargets?: Array<string | RegExp>;
}

/**
 * Common interface that all provider adapters implement.
 * Requirements: 1.1, 2.1, 8.1, 9.1
 */
export interface ObservabilityClient {
  /**
   * Initialize the provider SDK. Must be called before any other method.
   * Safe to call in SSR environments — guards on typeof window.
   */
  init(config: ObservabilityConfig): void;

  /**
   * Record an error with optional context metadata.
   * Never throws — SDK errors are caught and logged as console warnings.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void;

  /**
   * Associate the current session with a user ID (requires explicit consent).
   * If called before init(), the association is queued and applied on init.
   * Passing null or empty string removes any existing user association.
   */
  setConsented(userId: string | null): void;

  /**
   * Returns true if a user ID is currently associated with the session.
   */
  isConsented(): boolean;

  /**
   * Tear down the provider SDK and flush any pending events.
   */
  shutdown(): Promise<void>;
}
