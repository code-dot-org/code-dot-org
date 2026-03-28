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

/** Structured log attributes — searchable key-value pairs. */
export type LogAttributes = Record<string, unknown>;

/**
 * OTel-aligned structured logger with six severity levels.
 * Mirrors OpenTelemetry SeverityText and Sentry's logger namespace.
 * Requirements: 13.1
 */
export interface ObservabilityLogger {
  trace(message: string, attributes?: LogAttributes): void;
  debug(message: string, attributes?: LogAttributes): void;
  info(message: string, attributes?: LogAttributes): void;
  warn(message: string, attributes?: LogAttributes): void;
  error(message: string, attributes?: LogAttributes): void;
  fatal(message: string, attributes?: LogAttributes): void;
}

/**
 * OTel-aligned metrics instruments.
 * Requirements: 14.1
 */
export interface ObservabilityMetrics {
  /** Monotonic counter — events, clicks, API calls. value defaults to 1. */
  count(name: string, value?: number, attributes?: LogAttributes): void;
  /** Current-value gauge — queue depth, active connections. */
  gauge(name: string, value: number, attributes?: LogAttributes): void;
  /** Value distribution — response times, payload sizes. */
  distribution(name: string, value: number, attributes?: LogAttributes): void;
}

/**
 * No-op implementations used as defaults before init and in NoopAdapter.
 */
export const NOOP_LOGGER: ObservabilityLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
};

export const NOOP_METRICS: ObservabilityMetrics = {
  count: () => {},
  gauge: () => {},
  distribution: () => {},
};

/**
 * Common interface that all provider adapters implement.
 * Requirements: 1.1, 2.1, 8.1, 9.1, 13.1, 14.1
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
   * Structured, leveled logger aligned with OTel severity levels.
   * Each method checks the session-based log sampling gate before forwarding.
   * No-op when logSampleRate is 0 or the session is not sampled.
   * Requirements: 13.1, 13.2
   */
  logger: ObservabilityLogger;

  /**
   * OTel-aligned metrics instruments (counter, gauge, distribution).
   * Each method checks the session-based metrics sampling gate before forwarding.
   * No-op when metricsSampleRate is 0 or the session is not sampled.
   * Requirements: 14.1, 14.2
   */
  metrics: ObservabilityMetrics;

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
