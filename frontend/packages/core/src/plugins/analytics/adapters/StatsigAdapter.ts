import {StatsigClient, type StatsigUser} from '@statsig/js-client';

import {CodeStudioConfig} from '../../../index';
import {getEnabledExperiments} from '../../experiments';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from '../types';

/**
 * The two of the SDK's eleven `auto_capture::*` events we drop. The remaining
 * nine ship. Console capture (`statsig::log_line`) is off by default and is
 * left off.
 */
const EXCLUDED_AUTO_CAPTURE_EVENTS: readonly string[] = [
  'auto_capture::performance',
  'auto_capture::page_view_end',
];

/**
 * Production pads to five digits; every other environment prefixes its tier so
 * non-production ids never collide with production ones.
 */
function formatUserId(userId: string): string {
  const {environment} = CodeStudioConfig;
  return environment === 'production'
    ? userId.padStart(5, '0')
    : `${environment}-${userId}`;
}

export class StatsigAdapter implements AnalyticsClient {
  private client: StatsigClient | undefined;
  private appliedUser: string | undefined;

  init(config: AnalyticsConfig, session: AnalyticsSession): void {
    if (!config.statsig?.clientKey) {
      throw new Error(
        '[analytics] provider "statsig" requires config.statsig.clientKey',
      );
    }

    // A `stableID` of undefined is the SDK's cue to mint and store an ID of its
    // own, which is what a session without persisted consent gets.
    const user: StatsigUser = {
      custom: {
        enabledExperiments: session.enabledExperiments,
        geRegion: session.geRegion ?? undefined,
        ...(config.user && {userType: config.user.userType}),
      },
      customIDs: {stableID: session.stableId},
      ...(config.user && {userID: formatUserId(config.user.userId)}),
    };
    this.appliedUser = JSON.stringify(user);

    this.client = new StatsigClient(config.statsig.clientKey, user, {
      environment: {tier: CodeStudioConfig.environment},
    });

    // Started before init rather than after it, as legacy does; the client
    // queues whatever autocapture emits before it is ready.
    if (config.statsig.autoCapture) {
      // A chunk that fails to load costs autocapture, not the rest of analytics.
      void this.startAutoCapture(this.client).catch(error =>
        console.warn('[analytics] autocapture failed to start:', error),
      );
    }

    void this.client.initializeAsync();
  }

  /**
   * Binds the provider's web-analytics autocapture to this adapter's client.
   *
   * The import stays dynamic and inside the caller's conditional so the package
   * lands in a chunk of its own: a page without autocapture never fetches it.
   *
   * One deliberate divergence from the legacy reporter, which builds a second
   * StatsigClient on the same SDK key for this. Two clients sharing a key
   * collide in the SDK's client registry and its shared failed-logs store, and
   * the SDK warns about it. Binding to the client we already have emits the
   * same events without the collision.
   */
  private async startAutoCapture(client: StatsigClient): Promise<void> {
    const {runStatsigAutoCapture} = await import('@statsig/web-analytics');
    runStatsigAutoCapture(client, {
      eventFilterFunc: event =>
        !EXCLUDED_AUTO_CAPTURE_EVENTS.includes(event.eventName),
    });
  }

  sendEvent(name: string, payload?: Record<string, unknown>): void {
    // The event name also rides in Statsig's `value` slot; dashboards key on it.
    this.client?.logEvent(
      name,
      name,
      payload as Record<string, string> | undefined,
    );
  }

  /**
   * Updates identity. The update carries no `customIDs`, so the user holds no
   * stable ID for the rest of the page load; dashboards depend on this shape.
   * Identical repeat calls are dropped because each update is a network fetch.
   */
  setUser(user: AnalyticsUser | null): void {
    if (!this.client || !user) return;

    const next: StatsigUser = {
      userID: formatUserId(user.userId),
      custom: {
        userType: user.userType,
        isVerifiedInstructor: user.isVerifiedInstructor,
        enabledExperiments: getEnabledExperiments(),
        educatorRole: user.educatorRole ?? undefined,
      },
    };

    // Every field is built from a fixed literal here, so key order is stable.
    const serialized = JSON.stringify(next);
    if (serialized === this.appliedUser) return;
    this.appliedUser = serialized;

    void this.client.updateUserAsync(next);
  }

  shutdown(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    return client?.shutdown() ?? Promise.resolve();
  }
}
