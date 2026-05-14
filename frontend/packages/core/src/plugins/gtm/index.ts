import type {CorePlugin, SiteConfig, SiteConfigExtensions} from '../../config';

import {GtmClient, NoopClient} from './client';
import type {GoogleTagManagerEvent, GtmClientApi, GtmConfig} from './types';

export type {GoogleTagManagerEvent, GtmClientApi, GtmConfig};

/** Module-level singleton — facade points at this client. */
let client: GtmClientApi = new NoopClient();

/** Test hook for swapping the active client. */
export function _initializeSingleton(c: GtmClientApi): void {
  client = c;
}

/** Forward an event through the active client. No-op until init. */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  client.trackEvent(name, props);
}

/**
 * Whether the live GTM client is currently active (i.e. the plugin was
 * registered and `gtmId` was present in the runtime config). Useful for
 * gating expensive prep work on consumers that don't always run with GTM.
 */
export function isEnabled(): boolean {
  return client.isEnabled();
}

/**
 * `CorePlugin` for Google Tag Manager. Register at bootstrap via
 * `initializeCore({plugins: [gtmPlugin]})`. The plugin is a no-op unless a
 * `gtmId` is present in the runtime config.
 */
export const gtmPlugin: CorePlugin = {
  onCoreReady(config: SiteConfig & SiteConfigExtensions): void {
    if (!config.gtm.gtmId) return;

    const live = new GtmClient();
    live.init(config.gtm);
    _initializeSingleton(live);
  },
};
