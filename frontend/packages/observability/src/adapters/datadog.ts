import {datadogLogs} from '@datadog/browser-logs';
import {datadogRum} from '@datadog/browser-rum';

import {isBrowser} from '../internal/ssrGuard';
import type {RumClient, RumClientConfig} from '../types';

interface AdapterState {
  initialized: boolean;
  degraded: boolean;
}

// Compliance settings required by privacy policy — do not remove without legal review
const DATADOG_PRIVACY_COMPLIANCE = {
  trackUserInteractions: false,
  trackResources: false,
  trackLongTasks: false,
  defaultPrivacyLevel: 'mask-user-input',
} as const;

export class DatadogAdapter implements RumClient {
  private state: AdapterState = {initialized: false, degraded: false};

  init(config: RumClientConfig): void {
    if (!isBrowser()) return;
    if (this.state.initialized) return;
    try {
      this.state.initialized = true;
      const opts = config.providerOptions ?? {};
      datadogRum.init({
        applicationId: (opts['applicationId'] as string) ?? '',
        clientToken: (opts['clientToken'] as string) ?? '',
        site: (opts['site'] as string) ?? 'datadoghq.com',
        service: config.applicationName,
        env: config.environment,
        version: config.version,
        ...DATADOG_PRIVACY_COMPLIANCE,
        ...opts,
      });
      datadogLogs.init({
        clientToken: (opts['clientToken'] as string) ?? '',
        site: (opts['site'] as string) ?? 'datadoghq.com',
        service: config.applicationName,
        env: config.environment,
        forwardErrorsToLogs: false,
      });
    } catch (err) {
      console.warn('[observability] Datadog RUM init failed, falling back to no-op.', err);
      this.state.degraded = true;
    }
  }

  recordLog(
    level: 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, unknown>
  ): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      datadogLogs.logger[level](message, context);
    } catch (err) {
      console.warn('[observability] Datadog recordLog failed.', err);
    }
  }

  recordMetric(
    name: string,
    value: number,
    options?: {unit?: string; dimensions?: Record<string, string>}
  ): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      datadogRum.addAction(name, {
        value,
        unit: options?.unit,
        ...options?.dimensions,
      });
    } catch (err) {
      console.warn('[observability] Datadog recordMetric failed.', err);
    }
  }

  incrementCounter(name: string, dimensions?: Record<string, string>): void {
    this.recordMetric(name, 1, {unit: 'count', dimensions});
  }

  shutdown(): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      datadogRum.stopSession();
    } catch (err) {
      console.warn('[observability] Datadog shutdown failed.', err);
    }
  }
}
