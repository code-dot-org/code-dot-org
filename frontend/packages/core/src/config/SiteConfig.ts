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
function parseRuntimeConfig(): ObservabilityRuntimeConfig {
  try {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="app-config"]',
    );
    if (!meta?.content) return {};
    return JSON.parse(meta.content) as ObservabilityRuntimeConfig;
  } catch {
    return {};
  }
}

/** `<meta name="cdo-api-url" content="same-origin">` — the page's own origin. */
const SAME_ORIGIN = 'same-origin';

/**
 * An API origin the PAGE names, overriding the one its hostname implies.
 *
 * The hostname decides normally, and a host the environment map does not know
 * is treated as `development` — `http://localhost-studio.code.org:3000`. That
 * is right for a laptop and wrong for a static build served from anywhere else
 * over HTTPS: the browser blocks an insecure subresource as mixed content, and
 * it blocks it BEFORE the request can reach a service worker, so a build whose
 * API is mocked by one never gets the chance to answer itself.
 *
 * `same-origin` is what such a build wants: a URL the browser will allow, which
 * the mock handlers match (they take any host), and which leaves the page only
 * if nothing has claimed it.
 *
 * A meta tag rather than a build-time env var, because this is a property of
 * the deployment, not of the bundle — and because an `import.meta.env` read
 * inside this package is inlined when THIS package is built, long before an app
 * that consumes its `dist` could set it.
 */
function parseApiUrlOverride(): string | undefined {
  const content = document
    .querySelector<HTMLMetaElement>('meta[name="cdo-api-url"]')
    ?.content?.trim();
  if (!content) {
    return undefined;
  }
  return content === SAME_ORIGIN ? window.location.origin : content;
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
    this.dashboardApiUrl =
      parseApiUrlOverride() ?? getDashboardApiUrl(this.environment);
    this.marketingOrigin = getMarketingOrigin(this.brand, this.environment);

    const runtime = parseRuntimeConfig();
    this.observability = {
      provider: runtime.observability?.provider ?? 'none',
      ...runtime.observability,
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
