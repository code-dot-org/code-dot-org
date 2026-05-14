import type {AnalyticsClient, AnalyticsUser, EventProps} from '../types';

/** Cap on buffered events — prevents unbounded growth when the SDK never loads. */
const MAX_BUFFERED_EVENTS = 1000;

/**
 * Buffers analytics calls made before the live provider client is ready, then
 * replays them once `flushTo()` is called with the live client. Mirrors the
 * observability plugin's `DeferredAdapter`.
 *
 * Calls that need a synchronous return value (`getExperiment`) can't be
 * buffered — the deferred adapter returns the caller's `defaultValue`. The
 * provider's real value takes over for subsequent calls once it's installed.
 */
export class DeferredAdapter implements AnalyticsClient {
  private events: Array<{name: string; props?: EventProps}> = [];
  private pendingUser: AnalyticsUser | undefined;
  private sessionReplayPending = false;
  private flushed = false;
  private overflowWarned = false;

  async init(): Promise<void> {}

  trackEvent(name: string, props?: EventProps): void {
    if (this.flushed) return;
    if (this.events.length >= MAX_BUFFERED_EVENTS) {
      // SDK never loaded (firewall, ad blocker, etc). Drop oldest, warn once.
      this.events.shift();
      if (!this.overflowWarned) {
        console.warn(
          `[analytics] deferred buffer hit ${MAX_BUFFERED_EVENTS} events; dropping oldest. Is the SDK loading?`,
        );
        this.overflowWarned = true;
      }
    }
    this.events.push({name, props});
  }

  async setUser(user: AnalyticsUser): Promise<void> {
    if (this.flushed) return;
    this.pendingUser = user;
  }

  getExperiment<T>(
    _experimentName: string,
    _parameter: string,
    defaultValue: T,
  ): T {
    return defaultValue;
  }

  async startSessionReplay(): Promise<void> {
    if (this.flushed) return;
    this.sessionReplayPending = true;
  }

  stopSessionReplay(): void {
    if (this.flushed) return;
    this.sessionReplayPending = false;
  }

  async shutdown(): Promise<void> {}

  /**
   * Plugin is registered and the live SDK is loading — treat as enabled so
   * callers don't skip prep work that we'll buffer and replay.
   */
  isEnabled(): boolean {
    return true;
  }

  /**
   * Replay the buffered calls against the real client and prevent further
   * buffering. Idempotent.
   */
  async flushTo(live: AnalyticsClient): Promise<void> {
    if (this.flushed) return;
    this.flushed = true;

    if (this.pendingUser) {
      await live.setUser(this.pendingUser);
      this.pendingUser = undefined;
    }
    for (const {name, props} of this.events) {
      live.trackEvent(name, props);
    }
    this.events = [];
    if (this.sessionReplayPending) {
      await live.startSessionReplay();
      this.sessionReplayPending = false;
    }
  }
}
