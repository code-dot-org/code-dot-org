import type {
  LogAttributes,
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
} from '../types';
import {NOOP_LOGGER, NOOP_METRICS} from '../types';

type DeferredOperation = (client: ObservabilityClient) => void | Promise<void>;

export class DeferredAdapter implements ObservabilityClient {
  private delegate: ObservabilityClient | null = null;
  private pendingOperations: DeferredOperation[] = [];
  private consentedUserId: string | null = null;

  logger: ObservabilityLogger = this.createDeferredLogger();
  metrics: ObservabilityMetrics = this.createDeferredMetrics();

  init(config: ObservabilityConfig): void {
    this.enqueue(client => client.init(config));
  }

  recordError(error: unknown, context?: Record<string, unknown>): void {
    this.enqueue(client => client.recordError(error, context));
  }

  setConsented(userId: string | null): void {
    this.consentedUserId = userId || null;
    this.enqueue(client => client.setConsented(this.consentedUserId));
  }

  isConsented(): boolean {
    return this.delegate?.isConsented() ?? Boolean(this.consentedUserId);
  }

  shutdown(): Promise<void> {
    if (!this.delegate) {
      return Promise.resolve();
    }

    return this.delegate.shutdown();
  }

  flushTo(client: ObservabilityClient): void {
    const pendingOperations = this.pendingOperations;
    this.pendingOperations = [];
    this.delegate = client;
    this.logger = client.logger ?? NOOP_LOGGER;
    this.metrics = client.metrics ?? NOOP_METRICS;

    for (const operation of pendingOperations) {
      void operation(client);
    }
  }

  private enqueue(operation: DeferredOperation): void {
    if (this.delegate) {
      void operation(this.delegate);
      return;
    }

    this.pendingOperations.push(operation);
  }

  private createDeferredLogger(): ObservabilityLogger {
    const defer =
      (level: keyof ObservabilityLogger) =>
      (message: string, attributes?: LogAttributes) => {
        this.enqueue(client => client.logger[level](message, attributes));
      };

    return {
      trace: defer('trace'),
      debug: defer('debug'),
      info: defer('info'),
      warn: defer('warn'),
      error: defer('error'),
      fatal: defer('fatal'),
    };
  }

  private createDeferredMetrics(): ObservabilityMetrics {
    return {
      count: (name, value, attributes) => {
        this.enqueue(client => client.metrics.count(name, value, attributes));
      },
      gauge: (name, value, attributes) => {
        this.enqueue(client => client.metrics.gauge(name, value, attributes));
      },
      distribution: (name, value, attributes) => {
        this.enqueue(client =>
          client.metrics.distribution(name, value, attributes),
        );
      },
    };
  }
}
