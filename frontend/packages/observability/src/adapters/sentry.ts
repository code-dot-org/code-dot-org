import * as Sentry from '@sentry/browser';

import {CodeStudioConfig, getDashboardApiUrl} from '@code-dot-org/core';

import type {ObservabilityConfig} from '../types';
import {BaseAdapter} from './base';

/**
 * SentryAdapter wraps @sentry/browser and implements ObservabilityClient
 * via BaseAdapter (which owns session ID state, consent queue, and sampling).
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 4.4, 5.1, 5.2, 5.4, 5.5,
 *               6.2, 6.4, 8.2, 8.4, 9.2, 9.3, 9.5, 13.1–13.3, 14.1–14.3
 */
export class SentryAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
    const logSampleRate = config.sampling?.logSampleRate ?? 0;
    const metricsSampleRate = config.sampling?.metricsSampleRate ?? 0;

    Sentry.init({
      dsn: config.sentry?.dsn,
      environment: CodeStudioConfig.environment,
      sendDefaultPii: false,
      integrations: [Sentry.browserTracingIntegration()],
      tracePropagationTargets:
        config.tracePropagationTargets ?? [this.getAllowedTracingUrls()],
      sampleRate: config.sampling?.errorSampleRate ?? 1.0,
      tracesSampleRate: config.sampling?.tracesSampleRate ?? 0,
      // Req 9.2: enable Sentry log ingestion only when a non-zero rate is configured
      enableLogs: logSampleRate > 0,
      // Req 10.2: disable Sentry metrics buffering entirely when rate is 0
      enableMetrics: metricsSampleRate > 0,
    });
  }

  protected applyConsentToProvider(userId: string | null): void {
    Sentry.setUser(userId ? {id: userId} : null);
  }

  /**
   * Wire up the live logger after SDK init.
   * Each method gates on isLogSampled() before calling Sentry.logger.*.
   * Requirements: 13.1, 13.2, 13.3
   */
  protected initLogger(config: ObservabilityConfig): void {
    const rate = config.sampling?.logSampleRate;
    const makeMethod =
      (level: keyof typeof Sentry.logger) =>
      (message: string, attributes?: Record<string, unknown>) => {
        if (!this.isLogSampled(rate)) return;
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
   * Each method gates on isMetricsSampled() before calling Sentry.metrics.*.
   * Requirements: 14.1, 14.2, 14.3
   */
  protected initMetrics(config: ObservabilityConfig): void {
    const rate = config.sampling?.metricsSampleRate;

    this.metrics = {
      count: (name, value = 1, attributes) => {
        if (!this.isMetricsSampled(rate)) return;
        try {
          Sentry.metrics.count(name, value, {tags: attributes});
        } catch (err) {
          console.warn('[observability] SentryAdapter.metrics.count failed:', err);
        }
      },
      gauge: (name, value, attributes) => {
        if (!this.isMetricsSampled(rate)) return;
        try {
          Sentry.metrics.gauge(name, value, {tags: attributes});
        } catch (err) {
          console.warn('[observability] SentryAdapter.metrics.gauge failed:', err);
        }
      },
      distribution: (name, value, attributes) => {
        if (!this.isMetricsSampled(rate)) return;
        try {
          Sentry.metrics.distribution(name, value, {tags: attributes});
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
  shutdown(): Promise<void> {
    return Sentry.close().then(() => undefined);
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
