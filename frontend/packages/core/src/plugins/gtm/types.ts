/**
 * Runtime config for the GTM plugin. Parsed by `SiteConfig` from the `gtm`
 * slot of the Rails-injected `<meta name="app-config">`.
 */
export interface GtmConfig {
  /**
   * GTM container ID, e.g. `GTM-XXXXXX`. When omitted, the plugin remains a
   * no-op and no third-party script is injected.
   */
  gtmId?: string;
}

/**
 * Shape of events pushed to `window.dataLayer`. The first form is the
 * synthetic init record GTM expects; the second is the standard
 * `['event', name, props]` tuple all `trackEvent` calls produce.
 */
export type GoogleTagManagerEvent =
  | {'gtm.start': number; event: string}
  | [string, string, Record<string, string | number | boolean>];

/**
 * Backend contract. Lets us swap the GTM client out for a `NoopClient`
 * before init (and in tests).
 */
export interface GtmClientApi {
  init(config: GtmConfig): void;
  trackEvent(
    name: string,
    props?: Record<string, string | number | boolean>,
  ): void;
  isEnabled(): boolean;
}

declare global {
  interface Window {
    dataLayer?: GoogleTagManagerEvent[];
  }
}
