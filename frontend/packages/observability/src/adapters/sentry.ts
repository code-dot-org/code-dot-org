import * as Sentry from '@sentry/browser';
import type {Integration} from '@sentry/core';

import {CodeStudioConfig, getDashboardApiUrl} from '@code-dot-org/core';

import type {ObservabilityConfig} from '../types';
import {BaseAdapter} from './base';

/**
 * SentryAdapter wraps @sentry/browser and implements ObservabilityClient
 * via BaseAdapter (which owns session ID state, consent queue, and sampling).
 *
 * Sampling strategy: SDK-level feature flags (`enableLogs`, `enableMetrics`) are
 * computed once at init time using the session ID resolved by BaseAdapter.init()
 * before this method is called. No per-call sampling checks are needed in
 * initLogger/initMetrics — the SDK handles ingestion gating.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4, 5.1, 5.2, 5.4, 5.5,
 *               6.2, 6.4, 8.2, 8.4, 9.2, 9.3, 9.5, 13.1–13.3, 14.1–14.3,
 *               15.1–15.4
 */
export class SentryAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
    // Session ID is already resolved by BaseAdapter.init() before this call,
    // so isLogSampled/isMetricsSampled return correct values here.
    const enableLogs = this.isLogSampled(config.sampling?.logSampleRate);
    const enableMetrics = this.isMetricsSampled(config.sampling?.metricsSampleRate);

    const integrations: Integration[] = [Sentry.browserTracingIntegration()];
    // Req 15.3, 15.4: capture console.error as a Sentry log only when logs are sampled
    if (enableLogs) {
      integrations.push(Sentry.consoleLoggingIntegration({levels: ['error']}));
    }

    Sentry.init({
      dsn: config.sentry?.dsn,
      environment: CodeStudioConfig.environment,
      sendDefaultPii: false,
      integrations,
      tracePropagationTargets:
        config.tracePropagationTargets ?? [this.getAllowedTracingUrls()],
      sampleRate: config.sampling?.errorSampleRate ?? 1.0,
      tracesSampleRate: config.sampling?.tracesSampleRate ?? 0,
      // Req 9.2: enable Sentry log ingestion only when session is sampled
      enableLogs,
      // Req 10.2: enable Sentry metrics buffering only when session is sampled
      enableMetrics,
    });
  }

  protected applyConsentToProvider(userId: string | null): void {
    Sentry.setUser(userId ? {id: userId} : null);
  }

  /**
   * Wire up the live logger after SDK init.
   * No per-call sampling check — SDK gates ingestion via enableLogs set at init.
   * Requirements: 13.1, 13.2, 13.3
   */
  protected initLogger(_config: ObservabilityConfig): void {
    const makeMethod =
      (level: keyof typeof Sentry.logger) =>
      (message: string, attributes?: Record<string, unknown>) => {
        try {
          (Sentry.logger[level] as (m: string, a?: Record<string, unknown>) => void)(
            message,
            attributes,
          );
        } catch (err) {
          console.warn(`[observability] SentryAdapter.logger.${level} failed:`, err);
        }
      };

    this.logger = {
      trace: makeMethod('trace'),
      debug: makeMethod('debug'),
      info: makeMethod('info'),
      warn: makeMethod('warn'),
      error: makeMethod('error'),
      fatal: makeMethod('fatal'),
    };
  }

  /**
   * Wire up the live metrics instruments after SDK init.
   * No per-call sampling check — SDK gates ingestion via enableMetrics set at init.
   * Requirements: 14.1, 14.2, 14.3
   */
  protected initMetrics(_config: ObservabilityConfig): void {
    this.metrics = {
      count: (name, value = 1, attributes) => {
        try {
          Sentry.metrics.count(name, value, {attributes});
        } catch (err) {
          console.warn('[observability] SentryAdapter.metrics.count failed:', err);
        }
      },
      gauge: (name, value, attributes) => {
        try {
          Sentry.metrics.gauge(name, value, {attributes});
        } catch (err) {
          console.warn('[observability] SentryAdapter.metrics.gauge failed:', err);
        }
      },
      distribution: (name, value, attributes) => {
        try {
          Sentry.metrics.distribution(name, value, {attributes});
        } catch (err) {
          console.warn('[observability] SentryAdapter.metrics.distribution failed:', err);
        }
      },
    };
  }

  /**
   * Record an error with optional context metadata.
   * No-op if not initialized. Never throws.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      return;
    }
    try {
      Sentry.captureException(error, {extra: context});
    } catch (err) {
      console.warn('[observability] SentryAdapter.recordError failed:', err);
    }
  }

  /**
   * Tear down the Sentry SDK and flush pending events.
   */
  async shutdown(): Promise<void> {
    await Sentry.close();
  }

  /**
   * Returns the environment-appropriate tracing URL target.
   * adhoc → CDN regex; all others → dashboard API URL.
   * Requirements: 11.4
   */
  getAllowedTracingUrls(): string | RegExp {
    const environment = CodeStudioConfig.environment;
    if (environment === 'adhoc') {
      return /^https:\/\/.*\.cdn-code\.org/;
    }
    return getDashboardApiUrl(environment);
  }
}
