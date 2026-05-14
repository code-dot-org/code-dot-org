import type {AnalyticsClient} from '../types';

/**
 * Fallback adapter used when analytics is disabled or before a real provider
 * is wired up. All methods silently drop. `isEnabled` returns `false` so
 * callers can skip expensive prep work.
 */
export class NoopAdapter implements AnalyticsClient {
  async init(): Promise<void> {}
  trackEvent(): void {}
  async setUser(): Promise<void> {}
  getExperiment<T>(
    _experimentName: string,
    _parameter: string,
    defaultValue: T,
  ): T {
    return defaultValue;
  }
  async startSessionReplay(): Promise<void> {}
  stopSessionReplay(): void {}
  async shutdown(): Promise<void> {}
  isEnabled(): boolean {
    return false;
  }
}
