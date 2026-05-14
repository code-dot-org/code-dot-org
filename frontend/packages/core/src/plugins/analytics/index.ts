import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';

import {DeferredAdapter} from './adapters/DeferredAdapter';
import {NoopAdapter} from './adapters/NoopAdapter';
import {createAnalyticsClient} from './factory';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsUser,
  EventProps,
} from './types';

export type {AnalyticsClient, AnalyticsConfig, AnalyticsUser, EventProps};
export {createAnalyticsClient};

/** Module-level singleton — facade points at this client. */
let client: AnalyticsClient = new NoopAdapter();

/** Test hook for swapping the active client. */
export function _initializeSingleton(c: AnalyticsClient): void {
  client = c;
}

export function trackEvent(name: string, props?: EventProps): void {
  client.trackEvent(name, props);
}

export function setUser(user: AnalyticsUser): Promise<void> {
  return client.setUser(user);
}

export function getExperiment<T>(
  experimentName: string,
  parameter: string,
  defaultValue: T,
): T {
  return client.getExperiment(experimentName, parameter, defaultValue);
}

export function startSessionReplay(): Promise<void> {
  return client.startSessionReplay();
}

export function stopSessionReplay(): void {
  client.stopSessionReplay();
}

export function shutdown(): Promise<void> {
  return client.shutdown();
}

/**
 * Whether the live analytics provider is wired up. `false` when the plugin
 * isn't registered; `true` while the SDK is loading (events buffer) and
 * after it's live. Useful for gating expensive prep work on consumers that
 * don't always run with analytics enabled.
 */
export function isEnabled(): boolean {
  return client.isEnabled();
}

/**
 * `CorePlugin` for frontend product analytics. Provider-agnostic; currently
 * only Statsig is implemented. Calls before the live client is ready are
 * buffered by `DeferredAdapter` and replayed once the provider SDK loads.
 */
export const analyticsPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void {
    const runtime = config.analytics;
    if (runtime.provider === 'none' || runtime.provider === undefined) {
      return;
    }

    const deferred = new DeferredAdapter();
    _initializeSingleton(deferred);

    void createAnalyticsClient(runtime.provider)
      .then(async live => {
        await live.init(runtime as AnalyticsConfig);
        await deferred.flushTo(live);
        _initializeSingleton(live);
      })
      .catch(error => {
        console.warn(
          '[analytics] failed to create provider client; falling back to no-op:',
          error,
        );
        const noop = new NoopAdapter();
        void deferred.flushTo(noop);
        _initializeSingleton(noop);
      });
  },
};
