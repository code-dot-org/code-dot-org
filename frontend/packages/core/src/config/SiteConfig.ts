import type {Brand} from '../brand/brand';
import {getBrandFromHostname} from '../brand/getBrandFromHostname';
import {getDashboardApiUrl} from '../dashboard/getDashboardApiUrl';
import {getEnvironmentFromHostname, type Environment} from '../environment';
import {parse} from 'tldts';

declare global {
  interface Window {
    __CODE_STUDIO__: SiteConfig;
  }
}

export type RumProvider = 'newrelic' | 'datadog' | 'sentry' | 'none';

export interface DatadogConfig {
  applicationId: string;
  clientToken: string;
}

export interface NewRelicConfig {
  licenseKey: string;
  applicationId: string;
}

export interface SentryConfig {
  dsn: string;
}

export interface ObservabilityConfig {
  rumProvider: RumProvider;
  datadog?: DatadogConfig;
  newRelic?: NewRelicConfig;
  sentry?: SentryConfig;
}

/** Shape of the <meta name="app-config"> content attribute rendered by Rails */
export interface RuntimeConfig {
  appVersion?: string;
  observability?: Partial<ObservabilityConfig>;
}

export class SiteConfig {
  public readonly host: ReturnType<typeof parse>;
  public readonly brand: Brand;
  public readonly environment: Environment;
  public readonly dashboardApiUrl: string;
  public readonly appVersion?: string;
  public readonly observability: ObservabilityConfig;

  constructor() {
    this.host = parse(window.location.hostname);
    this.brand = getBrandFromHostname(this.host);
    this.environment = getEnvironmentFromHostname();
    this.dashboardApiUrl = getDashboardApiUrl(this.environment);

    const runtime = SiteConfig.readRuntimeConfig();
    this.appVersion = runtime.appVersion;
    this.observability = {
      rumProvider: runtime.observability?.rumProvider ?? 'none',
      datadog: runtime.observability?.datadog,
      newRelic: runtime.observability?.newRelic,
      sentry: runtime.observability?.sentry,
    };
  }

  private static readRuntimeConfig(): RuntimeConfig {
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
}

export default new SiteConfig();
