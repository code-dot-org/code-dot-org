import type {Brand} from '../brand/brand';
import {getBrandFromHostname} from '../brand/getBrandFromHostname';
import {getDashboardApiUrl} from '../dashboard/getDashboardApiUrl';
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
 * Example (in @code-dot-org/observability/plugin):
 *   declare module '@code-dot-org/core' {
 *     interface SiteConfigExtensions {
 *       observability: ObservabilityConfig;
 *     }
 *   }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SiteConfigExtensions {}

/**
 * Shape of the runtime config parsed from the <meta name="app-config"> tag.
 * Only the observability slice is typed here; other fields are opaque.
 */
interface RuntimeConfig {
  observability?: {
    provider?: 'sentry' | 'none';
    sentry?: {dsn: string};
    sampling?: {errorSampleRate?: number; tracesSampleRate?: number};
    tracePropagationTargets?: Array<string>;
  };
}

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

  /**
   * Observability runtime config parsed from the meta tag.
   * Typed as unknown here; the full type is added via SiteConfigExtensions
   * augmentation when @code-dot-org/observability/plugin is imported.
   * At runtime the data is always parsed regardless of which plugins are loaded.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly observability: any;

  constructor() {
    this.host = parse(window.location.hostname);
    this.brand = getBrandFromHostname(this.host);
    this.environment = getEnvironmentFromHostname();
    this.dashboardApiUrl = getDashboardApiUrl(this.environment);

    const runtime = parseRuntimeConfig();
    this.observability = {
      provider: runtime.observability?.provider ?? 'none',
      ...runtime.observability,
    };
  }
}

export default new SiteConfig() as SiteConfig & SiteConfigExtensions;
