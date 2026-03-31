import type {
  ObservabilityClient,
  ObservabilityConfig,
  ObservabilityLogger,
  ObservabilityMetrics,
} from '../types';
import {NOOP_LOGGER, NOOP_METRICS} from '../types';
import {getOrCreateObservabilitySessionId, isSampled} from '../sampling';

export abstract class BaseAdapter implements ObservabilityClient {
  protected initialized = false;
  protected observabilitySessionId: string | undefined;
  protected sessionStorageUnavailable = false;
  private consentedUserId: string | null = null;
  private pendingConsentedUserId: string | null | undefined;

  logger: ObservabilityLogger = NOOP_LOGGER;
  metrics: ObservabilityMetrics = NOOP_METRICS;

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

  isConsented(): boolean {
    return Boolean(this.pendingConsentedUserId ?? this.consentedUserId);
  }

  protected initLogger(): void {}

  protected initMetrics(): void {}

  protected applyConsentToProvider(userId: string | null): void {
    void userId;
  }

  protected isLogSampled(rate?: number): boolean {
    if (this.sessionStorageUnavailable) {
      return false;
    }

    return isSampled(this.observabilitySessionId, rate);
  }

  protected isMetricsSampled(rate?: number): boolean {
    if (this.sessionStorageUnavailable) {
      return false;
    }

    return isSampled(this.observabilitySessionId, rate);
  }

  protected abstract initProvider(config: ObservabilityConfig): void;

  abstract recordError(error: unknown, context?: Record<string, unknown>): void;

  abstract shutdown(): Promise<void>;
}
