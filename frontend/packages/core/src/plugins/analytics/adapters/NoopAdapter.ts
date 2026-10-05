import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from '../types';

/** Drops every call, keeping disabled environments and tests deterministic. */
export class NoopAdapter implements AnalyticsClient {
  init(config: AnalyticsConfig, session: AnalyticsSession): void {
    void config;
    void session;
  }

  sendEvent(name: string, payload?: Record<string, unknown>): void {
    void name;
    void payload;
  }

  setUser(user: AnalyticsUser | null): void {
    void user;
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
