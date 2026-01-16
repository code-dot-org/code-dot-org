import type {Brand} from '../brand/brand';
import {getBrandFromHostname} from '../brand/getBrandFromHostname';
import {getDashboardApiUrl} from '../dashboard/getDashboardApiUrl';
import {getEnvironmentFromHostname, type Environment} from '../environment';
import tldjs from 'tldjs';

declare global {
  interface Window {
    __CODE_STUDIO__: SiteConfig;
  }
}

export class SiteConfig {
  public readonly host: ReturnType<typeof tldjs.parse>;
  public readonly brand: Brand;
  public readonly environment: Environment;
  public readonly dashboardApiUrl: string;

  constructor() {
    this.host = tldjs.parse(window.location.hostname);
    this.brand = getBrandFromHostname(this.host);
    this.environment = getEnvironmentFromHostname();
    this.dashboardApiUrl = getDashboardApiUrl(this.environment);
  }
}

export default new SiteConfig();
