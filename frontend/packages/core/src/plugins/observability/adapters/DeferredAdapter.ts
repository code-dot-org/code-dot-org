import type {
  LogAttributes,
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  TagValue,
  SpanOptions,
} from '../types';
import {NOOP_LOGGER, NOOP_METRICS} from '../types';

type DeferredOperation = (client: ObservabilityClient) => void | Promise<void>;
const MAX_PENDING_OPERATIONS = 1000;

/**
 * Temporary adapter used while the real provider client is loading.
 * It records operations issued during startup and replays them once a concrete
 * client is available, preserving early logs, metrics, and consent changes.
 */
export class DeferredAdapter implements ObservabilityClient {
  private delegate: ObservabilityClient | null = null;
  private pendingOperations: DeferredOperation[] = [];
  private consentedUserId: string | null = null;

  logger: ObservabilityLogger = this.createDeferredLogger();
  metrics: ObservabilityMetrics = this.createDeferredMetrics();

  /**
   * Queue provider initialization so it runs after the real adapter is loaded.
   * @param config Normalized runtime configuration for the eventual provider.
   */
  init(config: ObservabilityConfig): void {
    this.enqueue(client => client.init(config));
  }

  /**
   * Queue startup errors so they are not lost during async bootstrap.
   * @param error The thrown value or exception-like object to record.
   * @param context Optional structured metadata to attach to the error event.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void {
    this.enqueue(client => client.recordError(error, context));
  }

  /**
   * Delegate to the real client if available, otherwise run the callback
   * directly. Spans cannot be deferred since they wrap live execution.
   */
  startSpan<T>(options: SpanOptions, callback: () => T): T {
    if (this.delegate) {
      return this.delegate.startSpan(options, callback);
    }
    return callback();
  }

  /**
   * Record consent immediately or replay it once a real provider is available.
   * Consent state is preserved during async bootstrap so the provider does not
   * emit user-associated data before privacy requirements have been applied.
   * @param userId Signed-in user id, or `null` when consent is revoked.
   */
  setConsented(userId: string | null): void {
    this.consentedUserId = userId || null;
    this.enqueue(client => client.setConsented(this.consentedUserId));
  }

  /**
   * Report the best-known consent state during or after bootstrap.
   * @returns `true` when consent is currently recorded.
   */
  isConsented(): boolean {
    return this.delegate?.isConsented() ?? Boolean(this.consentedUserId);
  }

  /**
   * Queue a tag set for replay against the eventual provider client.
   * @param key Tag name.
   * @param value Primitive tag value.
   */
  setTag(key: string, value: TagValue): void {
    this.enqueue(client => client.setTag(key, value));
  }

  /**
   * Queue a context set for replay against the eventual provider client.
   * @param name Context name.
   * @param ctx Structured context object, or `null` to clear.
   */
  setContext(name: string, ctx: Record<string, unknown> | null): void {
    this.enqueue(client => client.setContext(name, ctx));
  }

  /**
   * Shut down the current delegate if one has been installed.
   * @returns A promise that resolves once shutdown completes.
   */
  shutdown(): Promise<void> {
    if (!this.delegate) {
      return Promise.resolve();
    }

    return this.delegate.shutdown();
  }

  /**
   * Install the real client and replay all startup-time operations in order.
   * @param client Concrete provider client to install.
   */
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

  /**
   * Run immediately once a delegate exists, otherwise preserve order in memory.
   * @param operation Work to run against the real client.
   */
  private enqueue(operation: DeferredOperation): void {
    if (this.delegate) {
      void operation(this.delegate);
      return;
    }

    if (this.pendingOperations.length >= MAX_PENDING_OPERATIONS) {
      this.pendingOperations.shift();
    }

    this.pendingOperations.push(operation);
  }

  /**
   * Logger methods stay callable before provider initialization by enqueuing
   * their work instead of touching a provider SDK directly.
   */
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

  /**
   * Metrics methods stay callable before provider initialization by enqueuing
   * their work instead of touching a provider SDK directly.
   */
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
