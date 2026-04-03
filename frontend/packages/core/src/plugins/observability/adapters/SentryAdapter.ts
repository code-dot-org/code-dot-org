import * as Sentry from '@sentry/browser';
import {flatten} from 'flat';

import {CodeStudioConfig, getDashboardApiUrl} from '../../../index';
import type {Environment} from '../../../environment';
import type {ObservabilityConfig} from '../types';

import {BaseAdapter} from './BaseAdapter';

/**
 * Sentry-backed implementation of the provider-agnostic observability client.
 */
export class SentryAdapter extends BaseAdapter {
  /**
   * Initialize the Sentry SDK using the normalized runtime configuration.
   * @param config Normalized runtime configuration for the Sentry provider.
   */
  protected initProvider(config: ObservabilityConfig): void {
    if (!config.sentry?.dsn) {
      throw new Error(
        '[observability] provider "sentry" requires config.sentry.dsn',
      );
    }

    // Logs and metrics are sampled independently so the rollout can be tuned
    // without changing tracing or error-reporting behavior.
    const enableLogs = this.isLogSampled(config.sampling?.logSampleRate);
    const enableMetrics = this.isMetricsSampled(
      config.sampling?.metricsSampleRate,
    );

    const integrations: Array<
      | ReturnType<typeof Sentry.browserTracingIntegration>
      | ReturnType<typeof Sentry.consoleLoggingIntegration>
    > = [Sentry.browserTracingIntegration()];
    if (enableLogs) {
      integrations.push(Sentry.consoleLoggingIntegration({levels: ['error']}));
    }

    Sentry.init({
      dsn: config.sentry.dsn,
      environment: CodeStudioConfig.environment,
      sendDefaultPii: false,
      integrations,
      propagateTraceparent: true, // Enables trace propagation via the W3C Trace Context standard
      tracePropagationTargets: config.tracePropagationTargets ?? [
        this.getAllowedTracingTarget(CodeStudioConfig.environment),
      ],
      sampleRate: config.sampling?.errorSampleRate ?? 1.0,
      tracesSampleRate: config.sampling?.tracesSampleRate ?? 0,
      enableLogs,
      enableMetrics,
    });
  }

  /**
   * Consent is represented as a user id in Sentry so future events can be
   * associated with the current signed-in user only after consent is granted.
   * @param userId Signed-in user id, or `null` when consent is revoked.
   */
  protected applyConsentToProvider(userId: string | null): void {
    Sentry.setUser(userId ? {id: userId} : null);
  }

  /**
   * Wrap the Sentry logger so SDK failures degrade to console warnings instead
   * of breaking the caller's code path.
   */
  protected initLogger(): void {
    const sentryLoggerMethods = {
      trace: Sentry.logger.trace,
      debug: Sentry.logger.debug,
      info: Sentry.logger.info,
      warn: Sentry.logger.warn,
      error: Sentry.logger.error,
      fatal: Sentry.logger.fatal,
    } as const;

    const makeMethod =
      (level: keyof typeof sentryLoggerMethods) =>
      (message: string, attributes?: Record<string, unknown>) => {
        try {
          // Sentry's does not support nested objects as log attributes, so flatten them with dot notation
          const flatAttributes = attributes
            ? flatten<Record<string, unknown>, Record<string, unknown>>(
                attributes,
              )
            : undefined;

          // Log to Sentry
          sentryLoggerMethods[level](message, flatAttributes);
        } catch (error) {
          console.warn(
            `[observability] SentryAdapter.logger.${level} failed:`,
            error,
          );
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
   * Wrap Sentry metrics so SDK failures degrade to console warnings instead of
   * breaking the caller's code path.
   */
  protected initMetrics(): void {
    this.metrics = {
      count: (name, value = 1, attributes) => {
        try {
          Sentry.metrics.count(name, value, {attributes});
        } catch (error) {
          console.warn(
            '[observability] SentryAdapter.metrics.count failed:',
            error,
          );
        }
      },
      gauge: (name, value, attributes) => {
        try {
          Sentry.metrics.gauge(name, value, {attributes});
        } catch (error) {
          console.warn(
            '[observability] SentryAdapter.metrics.gauge failed:',
            error,
          );
        }
      },
      distribution: (name, value, attributes) => {
        try {
          Sentry.metrics.distribution(name, value, {attributes});
        } catch (error) {
          console.warn(
            '[observability] SentryAdapter.metrics.distribution failed:',
            error,
          );
        }
      },
    };
  }

  /**
   * Capture an exception with optional structured context, if initialized.
   * @param error The thrown value or exception-like object to record.
   * @param context Optional structured metadata to attach to the error event.
   */
  recordError(error: unknown, context?: Record<string, unknown>): void {
    if (!this.initialized) {
      return;
    }

    try {
      Sentry.captureException(error, {extra: context});
    } catch (sdkError) {
      console.warn(
        '[observability] SentryAdapter.recordError failed:',
        sdkError,
      );
    }
  }

  /**
   * Flush and close the Sentry client.
   * @returns A promise that resolves once Sentry has flushed and closed.
   */
  async shutdown(): Promise<void> {
    await Sentry.close();
  }

  /**
   * Keep trace propagation limited to dashboard-origin requests, except in
   * adhoc environments where assets may be served from CDN hosts.
   * @param environment Current Code.org environment.
   * @returns Host or pattern allowed to receive Sentry tracing headers.
   */
  private getAllowedTracingTarget(environment: Environment): string | RegExp {
    if (environment === 'adhoc') {
      return /^https:\/\/.*\.cdn-code\.org/;
    }

    return getDashboardApiUrl(environment);
  }
}
