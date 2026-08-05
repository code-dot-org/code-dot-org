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
      },
      customIDs: {stableID: session.stableId},
    };
    this.appliedUser = JSON.stringify(user);

    this.client = new StatsigClient(config.statsig.clientKey, user, {
      environment: {tier: CodeStudioConfig.environment},
    });
    void this.client.initializeAsync();
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
