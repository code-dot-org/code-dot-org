import type {
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
  TagValue,
  SpanOptions,
} from '../types';
import {NOOP_LOGGER, NOOP_METRICS} from '../types';
import {getOrCreateObservabilitySessionId, isSampled} from '../sampling';

/**
 * Shared adapter lifecycle for concrete observability providers.
 * Subclasses supply provider-specific setup while this base class handles
 * session sampling, consent state, and safe fallback behavior.
 */
export abstract class BaseAdapter implements ObservabilityClient {
  protected initialized = false;
  protected observabilitySessionId: string | undefined;
  protected sessionStorageUnavailable = false;
  private consentedUserId: string | null = null;
  private pendingConsentedUserId: string | null | undefined;
  private pendingTags = new Map<string, TagValue>();
  private pendingContexts = new Map<string, Record<string, unknown> | null>();

  logger: ObservabilityLogger = NOOP_LOGGER;
  metrics: ObservabilityMetrics = NOOP_METRICS;

  /**
   * Initialize the provider and wire up the public logger/metrics surfaces.
   * Failures intentionally degrade to no-op behavior instead of throwing.
   * @param config Normalized runtime configuration for the provider.
   */
  init(config: ObservabilityConfig): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      try {
        this.observabilitySessionId = getOrCreateObservabilitySessionId();
      } catch (error) {
        this.sessionStorageUnavailable = true;
        console.warn(
          '[observability] sessionStorage unavailable; log and metrics sampling disabled:',
          error,
        );
      }

      this.initProvider(config);
      this.initialized = true;
      this.initLogger();
      this.initMetrics();

      for (const [key, value] of this.pendingTags) {
        this.applyTagToProvider(key, value);
      }
      this.pendingTags.clear();

      for (const [name, ctx] of this.pendingContexts) {
        this.applyContextToProvider(name, ctx);
      }
      this.pendingContexts.clear();

      if (this.pendingConsentedUserId !== undefined) {
        this.applyConsentToProvider(this.pendingConsentedUserId);
        this.consentedUserId = this.pendingConsentedUserId;
        this.pendingConsentedUserId = undefined;
      }
    } catch (error) {
      console.warn('[observability] failed to initialize provider:', error);
      this.initialized = false;
      this.logger = NOOP_LOGGER;
      this.metrics = NOOP_METRICS;
    }
  }

  /**
   * Record consent state before or after provider initialization.
   * @param userId Signed-in user id, or `null` when consent is revoked.
   */
  setConsented(userId: string | null): void {
    const normalizedUserId = userId || null;

    if (!this.initialized) {
      this.pendingConsentedUserId = normalizedUserId;
      this.consentedUserId = normalizedUserId;
      return;
    }

    try {
      this.applyConsentToProvider(normalizedUserId);
      this.consentedUserId = normalizedUserId;
    } catch (error) {
      console.warn('[observability] failed to update consent state:', error);
    }
  }

  /**
   * Report whether consent is currently known for this adapter.
   * @returns `true` when consent is currently recorded.
   */
  isConsented(): boolean {
    return Boolean(this.pendingConsentedUserId ?? this.consentedUserId);
  }

  /**
   * Set or replace a session-scoped tag on the active provider.
   * Buffers the value until init() if the provider is not yet ready.
   * @param key Tag name (low-cardinality, indexed by the provider).
   * @param value Primitive tag value.
   */
  setTag(key: string, value: TagValue): void {
    if (!this.initialized) {
      this.pendingTags.set(key, value);
      return;
    }

    try {
      this.applyTagToProvider(key, value);
    } catch (error) {
      console.warn('[observability] failed to set tag:', error);
    }
  }

  /**
   * Attach a structured context blob to subsequent events on the active provider.
   * Buffers the value until init() if the provider is not yet ready. Pass `null`
   * to clear a previously-set context.
   * @param name Context name (used as the key in the provider event payload).
   * @param ctx Structured context object, or `null` to clear.
   */
  setContext(name: string, ctx: Record<string, unknown> | null): void {
    if (!this.initialized) {
      this.pendingContexts.set(name, ctx);
      return;
    }

    try {
      this.applyContextToProvider(name, ctx);
    } catch (error) {
      console.warn('[observability] failed to set context:', error);
    }
  }

  /**
   * Subclasses replace the default no-op logger after provider initialization.
   */
  protected initLogger(): void {}

  /**
   * Subclasses replace the default no-op metrics client after initialization.
   */
  protected initMetrics(): void {}

  /**
   * Subclasses apply user consent to the underlying provider when supported.
   * @param userId Signed-in user id, or `null` when consent is revoked.
   */
  protected applyConsentToProvider(userId: string | null): void {
    void userId;
  }

  /**
   * Subclasses apply a tag to the underlying provider when supported.
   * @param key Tag name.
   * @param value Primitive tag value.
   */
  protected applyTagToProvider(key: string, value: TagValue): void {
    void key;
    void value;
  }

  /**
   * Subclasses apply a structured context to the underlying provider when supported.
   * @param name Context name.
   * @param ctx Structured context object, or `null` to clear.
   */
  protected applyContextToProvider(
    name: string,
    ctx: Record<string, unknown> | null,
  ): void {
    void name;
    void ctx;
  }

  /**
   * Log sampling is disabled entirely when sessionStorage is unavailable.
   * @param rate Decimal sample rate between `0` and `1`.
   * @returns `true` when logs should be enabled for this session.
   */
  protected isLogSampled(rate?: number): boolean {
    if (this.sessionStorageUnavailable) {
      return false;
    }

    return isSampled(this.observabilitySessionId, rate);
  }

  /**
   * Metric sampling is disabled entirely when sessionStorage is unavailable.
   * @param rate Decimal sample rate between `0` and `1`.
   * @returns `true` when metrics should be enabled for this session.
   */
  protected isMetricsSampled(rate?: number): boolean {
    if (this.sessionStorageUnavailable) {
      return false;
    }

    return isSampled(this.observabilitySessionId, rate);
  }

  /**
   * Provider-specific SDK setup hook implemented by each concrete adapter.
   * @param config Normalized runtime configuration for the provider.
   */
  protected abstract initProvider(config: ObservabilityConfig): void;

  abstract recordError(error: unknown, context?: Record<string, unknown>): void;

  /**
   * Run callback inside a span. Subclasses override to attach provider tracing.
   * Default passes through with no instrumentation.
   */
  startSpan<T>(_options: SpanOptions, callback: () => T): T {
    return callback();
  }

  abstract shutdown(): Promise<void>;
}
