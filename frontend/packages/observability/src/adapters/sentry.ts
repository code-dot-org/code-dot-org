import * as Sentry from '@sentry/browser';

import {isBrowser} from '../internal/ssrGuard';
import type {RumClient, RumClientConfig} from '../types';

interface AdapterState {
  initialized: boolean;
  degraded: boolean;
}

// Compliance settings required by privacy policy — do not remove without legal review
const SENTRY_PRIVACY_COMPLIANCE = {
  sendDefaultPii: false,
} as const;

export class SentryAdapter implements RumClient {
  private state: AdapterState = {initialized: false, degraded: false};

  init(config: RumClientConfig): void {
    if (!isBrowser()) return;
    if (this.state.initialized) return;
    try {
      this.state.initialized = true;
      const opts = config.providerOptions ?? {};
      Sentry.init({
        dsn: (opts['dsn'] as string) ?? '',
        environment: config.environment,
        release: config.version,
        ...SENTRY_PRIVACY_COMPLIANCE,
        ...opts,
      });
    } catch (err) {
      console.warn(
        '[observability] Sentry init failed, falling back to no-op.',
        err,
      );
      this.state.degraded = true;
    }
  }

  recordLog(
    level: 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>,
  ): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      const sentryLevel = level === 'warn' ? 'warning' : level;
      Sentry.addBreadcrumb({level: sentryLevel, message, data: context});
    } catch (err) {
      console.warn('[observability] Sentry recordLog failed.', err);
    }
  }

  recordMetric(
    name: string,
    value: number,
    options?: {unit?: string; dimensions?: Record<string, string>},
  ): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      Sentry.metrics.distribution(name, value, {
        unit: options?.unit,
        attributes: options?.dimensions,
      });
    } catch (err) {
      console.warn('[observability] Sentry recordMetric failed.', err);
    }
  }

  incrementCounter(name: string, dimensions?: Record<string, string>): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      Sentry.metrics.count(name, 1, {attributes: dimensions});
    } catch (err) {
      console.warn('[observability] Sentry incrementCounter failed.', err);
    }
  }

  shutdown(): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      void Sentry.close();
    } catch (err) {
      console.warn('[observability] Sentry shutdown failed.', err);
    }
  }
}
