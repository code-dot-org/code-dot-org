import * as Sentry from '@sentry/browser';

import {CodeStudioConfig, getDashboardApiUrl} from '../../../index';
import type {Environment} from '../../../environment';
import type {ObservabilityConfig} from '../types';

import {BaseAdapter} from './BaseAdapter';

export class SentryAdapter extends BaseAdapter {
  protected initProvider(config: ObservabilityConfig): void {
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
      dsn: config.sentry?.dsn,
      environment: CodeStudioConfig.environment,
      sendDefaultPii: false,
      integrations,
      tracePropagationTargets: config.tracePropagationTargets ?? [
        this.getAllowedTracingTarget(CodeStudioConfig.environment),
      ],
      sampleRate: config.sampling?.errorSampleRate ?? 1.0,
      tracesSampleRate: config.sampling?.tracesSampleRate ?? 0,
      enableLogs,
      enableMetrics,
    });
  }

  protected applyConsentToProvider(userId: string | null): void {
    Sentry.setUser(userId ? {id: userId} : null);
  }

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
          sentryLoggerMethods[level](message, attributes);
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

  async shutdown(): Promise<void> {
    await Sentry.close();
  }

  private getAllowedTracingTarget(environment: Environment): string | RegExp {
    if (environment === 'adhoc') {
      return /^https:\/\/.*\.cdn-code\.org/;
    }

    return getDashboardApiUrl(environment);
  }
}
