import {StatsigClient, type StatsigUser} from '@statsig/js-client';

import {CodeStudioConfig} from '../../../index';
import {getEnabledExperiments} from '../../experiments';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsSession,
  AnalyticsUser,
} from '../types';

/** Dropped from the SDK's eleven auto_capture events; the other nine ship. */
const EXCLUDED_AUTO_CAPTURE_EVENTS: readonly string[] = [
  'auto_capture::performance',
  'auto_capture::page_view_end',
];

/** Tier-prefixed outside production, so ids never collide across tiers. */
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

    // An undefined stableID is the SDK's cue to mint and store its own.
    const user: StatsigUser = {
      custom: {
        enabledExperiments: session.enabledExperiments,
        // Legacy forwards the null, which the SDK's type omits but its wire accepts.
        geRegion: session.geRegion as string,
        ...(config.user && {userType: config.user.userType}),
      },
      customIDs: {stableID: session.stableId},
      ...(config.user && {userID: formatUserId(config.user.userId)}),
    };
    this.appliedUser = JSON.stringify(user);

    this.client = new StatsigClient(config.statsig.clientKey, user, {
      environment: {tier: CodeStudioConfig.environment},
    });

    // The client queues whatever autocapture emits before init completes.
    if (config.statsig.autoCapture) {
      // A chunk that fails to load costs autocapture, not the rest of analytics.
      void this.startAutoCapture(this.client).catch(error =>
        console.warn('[analytics] autocapture failed to start:', error),
      );
    }

    void this.client.initializeAsync();
  }

  /** One client: a second on the same SDK key collides in the SDK's registry. */
  private async startAutoCapture(client: StatsigClient): Promise<void> {
    const {runStatsigAutoCapture} = await import('@statsig/web-analytics');
    runStatsigAutoCapture(client, {
      eventFilterFunc: event =>
        !EXCLUDED_AUTO_CAPTURE_EVENTS.includes(event.eventName),
    });
  }

  sendEvent(
    name: string,
    payload?: Record<string, unknown>,
    value?: string | number,
  ): void {
    // Dashboards key on the name in the value slot when no value is given.
    this.client?.logEvent(
      name,
      value ?? name,
      payload as Record<string, string> | undefined,
    );
  }

  /** Dashboards depend on the update carrying no customIDs. */
  setUser(user: AnalyticsUser | null): void {
    if (!this.client || !user) return;

    const next: StatsigUser = {
      userID: formatUserId(user.userId),
      custom: {
        userType: user.userType,
        isVerifiedInstructor: user.isVerifiedInstructor,
        enabledExperiments: getEnabledExperiments(),
        // Legacy forwards the null, which the SDK's type omits but its wire accepts.
        educatorRole: user.educatorRole as string,
      },
    };

    // Dropped when identical: each update is a network fetch.
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
