import type {GtmClientApi, GtmConfig} from './types';

/**
 * GTM client. Initializes `window.dataLayer`, injects `gtm.js` once, and
 * forwards `trackEvent` calls onto the dataLayer. The legacy `_analytics.haml`
 * stub provides the same `dataLayer` so the same calls reach Rails-rendered
 * pages.
 */
export class GtmClient implements GtmClientApi {
  private initialized = false;

  init(config: GtmConfig): void {
    if (this.initialized || !config.gtmId) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    window.dataLayer ||= [];

    // Don't re-init if some other code already pushed onto dataLayer (e.g. a
    // Rails-rendered stub that fires before the SPA boots).
    if (window.dataLayer.length === 0) {
      window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});

      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript?.parentNode) {
        const gtmScript = document.createElement('script');
        gtmScript.async = true;
        gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${config.gtmId}`;
        firstScript.parentNode.insertBefore(gtmScript, firstScript);
      }
    }

    this.initialized = true;
  }

  trackEvent(
    name: string,
    props: Record<string, string | number | boolean> = {},
  ): void {
    if (typeof window === 'undefined') return;
    window.dataLayer?.push(['event', name, props]);
  }

  isEnabled(): boolean {
    return this.initialized;
  }
}

/**
 * Stand-in used before init and when the plugin is disabled (no `gtmId`).
 */
export class NoopClient implements GtmClientApi {
  init(): void {}
  trackEvent(): void {}
  isEnabled(): boolean {
    return false;
  }
}
