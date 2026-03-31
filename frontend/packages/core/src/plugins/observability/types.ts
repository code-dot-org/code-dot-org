export interface SamplingConfig {
  errorSampleRate?: number;
  tracesSampleRate?: number;
  logSampleRate?: number;
  metricsSampleRate?: number;
}

export interface ObservabilityConfig {
  provider: 'sentry' | 'none';
  sentry?: {
    dsn: string;
  };
  sampling?: SamplingConfig;
  tracePropagationTargets?: Array<string | RegExp>;
}

export type LogAttributes = Record<string, unknown>;

export interface ObservabilityLogger {
  trace(message: string, attributes?: LogAttributes): void;
  debug(message: string, attributes?: LogAttributes): void;
  info(message: string, attributes?: LogAttributes): void;
  warn(message: string, attributes?: LogAttributes): void;
  error(message: string, attributes?: LogAttributes): void;
  fatal(message: string, attributes?: LogAttributes): void;
}

export interface ObservabilityMetrics {
  count(name: string, value?: number, attributes?: LogAttributes): void;
  gauge(name: string, value: number, attributes?: LogAttributes): void;
  distribution(name: string, value: number, attributes?: LogAttributes): void;
}

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

export interface ObservabilityClient {
  init(config: ObservabilityConfig): void;
  recordError(error: unknown, context?: Record<string, unknown>): void;
  logger: ObservabilityLogger;
  metrics: ObservabilityMetrics;
  setConsented(userId: string | null): void;
  isConsented(): boolean;
  shutdown(): Promise<void>;
}
