/**
 * Session-scoped sampling controls for the different observability signals.
 */
export interface SamplingConfig {
  errorSampleRate?: number;
  tracesSampleRate?: number;
  logSampleRate?: number;
  metricsSampleRate?: number;
}

/**
 * Runtime configuration consumed by the observability plugin and adapters.
 */
export interface ObservabilityConfig {
  provider: 'sentry' | 'none';
  sentry?: {
    dsn: string;
  };
  sampling?: SamplingConfig;
  tracePropagationTargets?: Array<string | RegExp>;
}

/**
 * Structured metadata attached to logs and metrics.
 */
export type LogAttributes = Record<string, unknown>;

/**
 * Tag value type accepted by setTag. Sentry indexes these as low-cardinality
 * filterable dimensions, so non-primitive values are intentionally rejected.
 */
export type TagValue = string | number | boolean;

/**
 * Provider-agnostic logging surface exposed to consumers.
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
 * Provider-agnostic metrics surface exposed to consumers.
 */
export interface ObservabilityMetrics {
  count(name: string, value?: number, attributes?: LogAttributes): void;
  gauge(name: string, value: number, attributes?: LogAttributes): void;
  distribution(name: string, value: number, attributes?: LogAttributes): void;
}

/**
 * Default logger implementation used before a real provider is installed.
 */
export const NOOP_LOGGER: ObservabilityLogger = {
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
};

/**
 * Default metrics implementation used before a real provider is installed.
 */
export const NOOP_METRICS: ObservabilityMetrics = {
  count: () => {},
  gauge: () => {},
  distribution: () => {},
};

/**
 * Options for creating a span around a unit of work.
 */
export interface SpanOptions {
  name: string;
  op?: string;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * Minimal adapter contract shared by the module-level API and plugin bootstrap.
 */
export interface ObservabilityClient {
  init(config: ObservabilityConfig): void;
  recordError(
    error: unknown,
    context?: Record<string, unknown>,
    tags?: Record<string, TagValue>,
  ): void;
  startSpan<T>(options: SpanOptions, callback: () => T): T;
  logger: ObservabilityLogger;
  metrics: ObservabilityMetrics;
  setConsented(userId: string | null): void;
  isConsented(): boolean;
  setTag(key: string, value: TagValue): void;
  setContext(name: string, ctx: Record<string, unknown> | null): void;
  shutdown(): Promise<void>;
}
