import type {Brand} from '../brand/brand';
import {getBrandFromHostname} from '../brand/getBrandFromHostname';
import {getDashboardApiUrl} from '../dashboard/getDashboardApiUrl';
import {getMarketingOrigin} from './getMarketingOrigin';
import {getEnvironmentFromHostname, type Environment} from '../environment';
import {parse} from 'tldts';

declare global {
  interface Window {
    __CODE_STUDIO__: SiteConfig & SiteConfigExtensions;
  }
}

/**
 * Empty interface that plugins augment to extend SiteConfig's type.
 * Importing a plugin package causes its module augmentation to merge here.
 *
 * Example (in a plugin):
 *   declare module '@code-dot-org/core' {
 *     interface SiteConfigExtensions {
 *       observability: ObservabilityConfig;
 *     }
 *   }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SiteConfigExtensions {}

/**
 * Shape of the `<meta name="app-config">` runtime config blob. Each slot
 * here has a corresponding plugin under `plugins/*`; SiteConfig parses the
 * blob once at construction so plugins can read typed fields off `config`
 * in their `onCoreReady` without re-parsing.
 */
export interface RuntimeConfig {
  observability?: {
    provider?: 'sentry' | 'none';
    sentry?: {dsn: string};
    sampling?: {
      errorSampleRate?: number;
      tracesSampleRate?: number;
      logSampleRate?: number;
      metricsSampleRate?: number;
    };
    tracePropagationTargets?: Array<string>;
  };
  analytics?: {
    provider?: 'statsig' | 'none';
    statsig?: {
      sdkKey?: string;
      sessionReplaySdkKey?: string;
      autoCapture?: boolean;
      sessionReplay?: boolean;
    };
  };
  gtm?: {
    gtmId?: string;
  };
}

/**
 * Back-compat alias — the old name predates the multi-plugin runtime
 * config. New code should reference `RuntimeConfig`.
 */
export type ObservabilityRuntimeConfig = Pick<RuntimeConfig, 'observability'>;

/**
 * Parse the <meta name="app-config"> tag and return the runtime config.
 * Returns an empty object if the tag is absent or the JSON is malformed.
 */
function parseRuntimeConfig(): RuntimeConfig {
  try {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="app-config"]',
    );
    if (!meta?.content) return {};
    return JSON.parse(meta.content) as RuntimeConfig;
  } catch {
    return {};
  }
}

export class SiteConfig {
  public readonly host: ReturnType<typeof parse>;
  public readonly brand: Brand;
  public readonly environment: Environment;
  public readonly dashboardApiUrl: string;
  /** Brand- and environment-aware marketing-site origin (scheme + host). */
  public readonly marketingOrigin: string;

  /**
   * Observability runtime config parsed from the meta tag.
   * Always present; defaults to `{provider: 'none'}` when the slot is absent.
   */
  public readonly observability: NonNullable<RuntimeConfig['observability']>;

  /**
   * Analytics runtime config parsed from the meta tag.
   * Always present; defaults to `{provider: 'none'}` when the slot is absent.
   */
  public readonly analytics: NonNullable<RuntimeConfig['analytics']>;

  /**
   * GTM runtime config parsed from the meta tag.
   * Always present; no `gtmId` means the plugin remains a no-op.
   */
  public readonly gtm: NonNullable<RuntimeConfig['gtm']>;

  constructor() {
    this.host = parse(window.location.hostname);
    this.brand = getBrandFromHostname(this.host);
    this.environment = getEnvironmentFromHostname();
    this.dashboardApiUrl = getDashboardApiUrl(this.environment);
    this.marketingOrigin = getMarketingOrigin(this.brand, this.environment);

    const runtime = parseRuntimeConfig();
    this.observability = {
      provider: runtime.observability?.provider ?? 'none',
      ...runtime.observability,
    };
    this.analytics = {
      provider: runtime.analytics?.provider ?? 'none',
      ...runtime.analytics,
    };
    this.gtm = {...runtime.gtm};
  }

  /**
   * Build a brand- and environment-aware marketing-site URL.
   * Mirrors Rails's `CDO.code_org_url(path)`.
   * Pass-through when `path` is already absolute.
   * Empty `path` returns the origin itself.
   *
   * @param path - Relative path (e.g. '/privacy') or absolute URL.
   * @returns Fully-qualified URL string.
   */
  marketingUrl(path: string = ''): string {
    return path
      ? new URL(path, this.marketingOrigin).toString()
      : this.marketingOrigin;
  }
}

export default new SiteConfig() as SiteConfig & SiteConfigExtensions;
