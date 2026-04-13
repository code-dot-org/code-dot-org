import type {
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
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

  abstract shutdown(): Promise<void>;
}
