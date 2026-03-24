import {isBrowser} from '../internal/ssrGuard';
import type {RumClient, RumClientConfig} from '../types';

interface NewRelicAgent {
  setApplicationVersion(version: string): void;
  setCustomAttribute(name: string, value: string): void;
  log(message: string, options?: {level?: string; customAttributes?: Record<string, unknown>}): void;
  recordCustomEvent(eventType: string, attributes?: Record<string, unknown>): void;
}

interface AdapterState {
  initialized: boolean;
  degraded: boolean;
}

// Compliance settings required by privacy policy — do not remove without legal review
// New Relic browser agent does not expose a PII suppression init flag;
// compliance is maintained by never calling setUserId or setCustomAttribute
// with user-identifying values.
const NEWRELIC_PRIVACY_COMPLIANCE = {} as const;

function getNewRelic(): NewRelicAgent | undefined {
  if (!isBrowser()) return undefined;
  return (window as Window & {newrelic?: NewRelicAgent}).newrelic;
}

export class NewRelicAdapter implements RumClient {
  private state: AdapterState = {initialized: false, degraded: false};
  // NEWRELIC_PRIVACY_COMPLIANCE is intentionally referenced to document the compliance decision
  private readonly _compliance = NEWRELIC_PRIVACY_COMPLIANCE;

  init(config: RumClientConfig): void {
    if (!isBrowser()) return;
    if (this.state.initialized) return;
    try {
      this.state.initialized = true;
      const nr = getNewRelic();
      if (!nr) return; // agent not loaded (e.g. blocked), stay initialized but effectively no-op
      if (config.version) {
        nr.setApplicationVersion(config.version);
      }
      nr.setCustomAttribute('environment', config.environment);
    } catch (err) {
      console.warn('[observability] New Relic init failed, falling back to no-op.', err);
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
      const nr = getNewRelic();
      if (!nr) return;
      nr.log(message, {level, customAttributes: context});
    } catch (err) {
      console.warn('[observability] New Relic recordLog failed.', err);
    }
  }

  recordMetric(
    name: string,
    value: number,
    options?: {unit?: string; dimensions?: Record<string, string>}
  ): void {
    if (this.state.degraded || !this.state.initialized) return;
    try {
      const nr = getNewRelic();
      if (!nr) return;
      nr.recordCustomEvent(name, {
        value,
        unit: options?.unit,
        ...options?.dimensions,
      });
    } catch (err) {
      console.warn('[observability] New Relic recordMetric failed.', err);
    }
  }

  incrementCounter(name: string, dimensions?: Record<string, string>): void {
    this.recordMetric(name, 1, {unit: 'count', dimensions});
  }

  shutdown(): void {
    // New Relic browser agent has no shutdown API — intentional no-op
  }
}
