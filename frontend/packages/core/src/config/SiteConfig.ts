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
 * Shape of the frontend analytics runtime config parsed from the
 * <meta name="app-config"> tag.
 */
export interface AnalyticsRuntimeConfig {
  analytics?: {
    provider?: 'statsig' | 'none';
    enabled?: boolean;
    statsig?: {clientKey: string};
    user?: {userId: string; userType?: string};
  };
}

/**
 * Shape of the frontend observability runtime config parsed from the
 * <meta name="app-config"> tag.
 */
export interface ObservabilityRuntimeConfig {
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
}

/**
 * Parse the <meta name="app-config"> tag and return the runtime config.
 * Returns an empty object if the tag is absent or the JSON is malformed.
 */
function parseRuntimeConfig(): AnalyticsRuntimeConfig &
  ObservabilityRuntimeConfig {
  try {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="app-config"]',
    );
    if (!meta?.content) return {};
    return JSON.parse(meta.content) as AnalyticsRuntimeConfig &
      ObservabilityRuntimeConfig;
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
   * Analytics runtime config parsed from the meta tag.
   * Like observability, this is part of SiteConfig itself because core parses
   * the runtime config before any plugins run.
   */
  public readonly analytics: NonNullable<AnalyticsRuntimeConfig['analytics']>;

  /**
   * Observability runtime config parsed from the meta tag.
   * This is part of SiteConfig itself because core parses the runtime config
   * before any plugins run.
   */
  public readonly observability: NonNullable<
    ObservabilityRuntimeConfig['observability']
  >;

  constructor() {
    this.host = parse(window.location.hostname);
    this.brand = getBrandFromHostname(this.host);
    this.environment = getEnvironmentFromHostname();
    this.dashboardApiUrl = getDashboardApiUrl(this.environment);
    this.marketingOrigin = getMarketingOrigin(this.brand, this.environment);

    // Normalize `provider` after the spread: the meta tag is untrusted input,
    // and spreading last would let an explicit `"provider": null` overwrite
    // the default and leave the field unset.
    const runtime = parseRuntimeConfig();
    this.analytics = {
      ...runtime.analytics,
      provider: runtime.analytics?.provider ?? 'none',
    };
    this.observability = {
      ...runtime.observability,
      provider: runtime.observability?.provider ?? 'none',
    };
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
