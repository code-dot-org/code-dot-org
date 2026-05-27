import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';

import {GtmClient} from './client';
import {_initializeSingleton} from './singleton';
import type {GoogleTagManagerEvent, GtmClientApi, GtmConfig} from './types';

export type {GoogleTagManagerEvent, GtmClientApi, GtmConfig};

// Re-export the imperative API from `./singleton`. The state lives there so
// `./hooks` consumes it as a pure dependency, with no cycle through this
// file.
export {
  _initializeSingleton,
  _subscribe,
  isEnabled,
  trackEvent,
} from './singleton';

// Re-export the React hooks. They live in `./hooks` so the React import
// stays out of consumers that only want the imperative API.
export * from './hooks';

// ─── Plugin ─────────────────────────────────────────────────────────────────

/**
 * `CorePlugin` for Google Tag Manager. Register at bootstrap via
 * `initializeCore({plugins: [gtmPlugin]})`. The plugin is a no-op unless a
 * `gtmId` is present in the runtime config.
 */
export const gtmPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void {
    if (!config.gtm.gtmId) return;

    const live: GtmClientApi = new GtmClient();
    live.init(config.gtm);
    _initializeSingleton(live);
  },
};
