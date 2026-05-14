import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';

import {DeferredAdapter} from './adapters/DeferredAdapter';
import {NoopAdapter} from './adapters/NoopAdapter';
import {createAnalyticsClient} from './factory';
import {_initializeSingleton} from './singleton';
import type {
  AnalyticsClient,
  AnalyticsConfig,
  AnalyticsUser,
  EventProps,
} from './types';

export type {AnalyticsClient, AnalyticsConfig, AnalyticsUser, EventProps};
export {createAnalyticsClient};

// Re-export the imperative API. Runtime state lives in `./singleton` so the
// React hooks and plugin lifecycle consume it as a pure dependency, without
// any almost-cycle between this file and `./hooks`.
export {
  _initializeSingleton,
  _subscribe,
  getExperiment,
  isEnabled,
  setUser,
  shutdown,
  startSessionReplay,
  stopSessionReplay,
  trackEvent,
} from './singleton';

// Re-export the React hooks. They live in `./hooks` so the React import
// stays out of consumers that only want the imperative API.
export * from './hooks';

// ─── Plugin ─────────────────────────────────────────────────────────────────

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
