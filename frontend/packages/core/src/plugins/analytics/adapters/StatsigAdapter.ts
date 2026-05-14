import {StatsigClient} from '@statsig/js-client';
import type {AnyStatsigOptions, StatsigUser} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';
import {runStatsigAutoCapture} from '@statsig/web-analytics';

import {
  getEnvironmentFromHostname,
  isDevelopmentEnvironment,
  isProductionEnvironment,
} from '../../../environment';
import * as experiments from '../../../gates/experiments';
import {
  formatUserId,
  getStableId,
  getUserID,
  getUserType,
} from './statsigHelpers';

import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsUser,
  EventProps,
} from '../types';

interface CustomPayload {
  enabledExperiments: string[];
  userType?: string;
  isVerifiedInstructor?: boolean;
  educatorRole?: string;
}

interface StatsigPayload extends StatsigUser {
  custom: CustomPayload & StatsigUser['custom'];
  customIDs: {stableID?: string};
}

const NO_EVENT_NAME = 'NO_VALID_EVENT_NAME_LOG_ERROR';

/** "Managed test server" sends like prod — read from a script tag on the page. */
function isManagedTestEnvironment(): boolean {
  if (typeof document === 'undefined') return false;
  const el = document.querySelector('script[data-managed-test-server]') as
    | HTMLElement
    | undefined;
  return el?.dataset?.managedTestServer === 'true';
}

/** Catch and warn — SDK calls must never throw out to lab/app render paths. */
function safe<T>(label: string, fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.warn(`[analytics] ${label} threw:`, error);
    return fallback;
  }
}

async function safeAsync<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[analytics] ${label} threw:`, error);
    return fallback;
  }
}

/**
 * Statsig-backed analytics: event logging, experiments/gates, and session
 * replay. Each capability runs on its own `StatsigClient` because Statsig
 * segments the analytics SDK from the session-replay SDK. SDK calls are
 * wrapped — provider failures must not propagate to caller render paths.
 */
export class StatsigAdapter implements AnalyticsClient {
  private client?: StatsigClient;
  private replayClient?: StatsigClient;
  private initialized = false;
  private user: StatsigPayload = {
    custom: {enabledExperiments: []},
    customIDs: {},
  };
  private analyticsSdkKey = '';
  private replaySdkKey = '';
  private localMode = true;

  async init(config: AnalyticsConfig): Promise<void> {
    if (typeof document === 'undefined') return;

    this.user = this.buildInitialUser();
    this.analyticsSdkKey = config.statsig?.sdkKey ?? '';
    this.replaySdkKey = config.statsig?.sessionReplaySdkKey ?? '';
    this.localMode = !isProductionEnvironment() && !isManagedTestEnvironment();

    if (this.shouldSend() && this.analyticsSdkKey) {
      await safeAsync(
        'init',
        async () => {
          const options: AnyStatsigOptions = {
            environment: {tier: getEnvironmentFromHostname()},
          };
          this.client = new StatsigClient(
            this.analyticsSdkKey,
            this.user,
            options,
          );
          await this.client.initializeAsync();
          if (config.statsig?.autoCapture) {
            runStatsigAutoCapture(this.client);
          }
        },
        undefined,
      );
    }

    if (config.statsig?.sessionReplay && this.replaySdkKey) {
      await this.startSessionReplay();
    }

    this.initialized = true;
  }

  trackEvent(name: string, props: EventProps = {}): void {
    if (!this.shouldSend()) {
      this.log(`${name}. Props: ${JSON.stringify({props})}`);
      return;
    }
    if (!this.client) return;
    safe(
      'trackEvent',
      () => {
        if (!name) {
          console.warn(
            '[analytics] Statsig event sent with no name; falling back to ' +
              NO_EVENT_NAME,
            props,
          );
          this.client!.logEvent(
            NO_EVENT_NAME,
            NO_EVENT_NAME,
            this.coerce(props),
          );
          return;
        }
        // Statsig expects (name, value, data). We pass the name as both name
        // and value because our event taxonomy doesn't use the `value` slot.
        this.client!.logEvent(name, name, this.coerce(props));
      },
      undefined,
    );
  }

  async setUser(user: AnalyticsUser): Promise<void> {
    if (!user.userId) return;

    const userPayload: StatsigPayload = {
      ...this.user,
      userID: formatUserId(user.userId),
      custom: {
        ...this.user.custom,
        enabledExperiments:
          user.enabledExperiments ?? this.user.custom.enabledExperiments,
        userType: user.userType,
        isVerifiedInstructor: user.isVerifiedInstructor,
        educatorRole: user.educatorRole,
      },
    };
    this.user = userPayload;

    if (!this.shouldSend()) {
      this.log(`User update: ${JSON.stringify(userPayload)}`);
      return;
    }
    await safeAsync(
      'setUser',
      async () => {
        await this.client?.updateUserAsync(userPayload);
      },
      undefined,
    );
  }

  getExperiment<T>(
    experimentName: string,
    parameter: string,
    defaultValue: T,
  ): T {
    if (this.localMode || !this.client) return defaultValue;
    return safe(
      'getExperiment',
      () => {
        const value = this.client!.getExperiment(experimentName).value;
        const result = (value as Record<string, unknown>)[parameter];
        return (result as T | undefined) ?? defaultValue;
      },
      defaultValue,
    );
  }

  async startSessionReplay(): Promise<void> {
    if (this.replayClient) return;
    if (!this.replaySdkKey) return;
    if (this.localMode) return;

    await safeAsync(
      'startSessionReplay',
      async () => {
        this.replayClient = new StatsigClient(this.replaySdkKey, this.user);
        runStatsigSessionReplay(this.replayClient);
        runStatsigAutoCapture(this.replayClient);
        await this.replayClient.initializeAsync();
      },
      undefined,
    );
  }

  stopSessionReplay(): void {
    if (!this.replayClient) return;
    safe(
      'stopSessionReplay',
      () => {
        this.replayClient!.shutdown();
      },
      undefined,
    );
    this.replayClient = undefined;
  }

  async shutdown(): Promise<void> {
    safe('shutdown.client', () => this.client?.shutdown(), undefined);
    safe('shutdown.replay', () => this.replayClient?.shutdown(), undefined);
    this.client = undefined;
    this.replayClient = undefined;
    this.initialized = false;
  }

  isEnabled(): boolean {
    return this.initialized && this.shouldSend();
  }

  private shouldSend(): boolean {
    return !this.localMode;
  }

  /**
   * Coerce booleans in props to strings — Statsig's logEvent payload type is
   * `Record<string, string>`. We accept the wider `EventProps` shape from
   * callers so the public API matches the GTM plugin.
   */
  private coerce(props: EventProps): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(props)) {
      out[k] = typeof v === 'string' ? v : String(v);
    }
    return out;
  }

  /** Build the initial user payload from page-injected `<script data-*>` tags. */
  private buildInitialUser(): StatsigPayload {
    const stableID = getStableId();
    const user: StatsigPayload = {
      custom: {enabledExperiments: experiments.getEnabledExperiments()},
      customIDs: {stableID},
    };
    const userId = getUserID();
    const userType = getUserType();
    if (userId) {
      user.userID = formatUserId(userId);
      user.custom.userType = userType;
    }
    return user;
  }

  private log(message: string): void {
    if (isDevelopmentEnvironment()) {
      console.log(`[STATSIG ANALYTICS]: ${message}`);
    }
  }
}
