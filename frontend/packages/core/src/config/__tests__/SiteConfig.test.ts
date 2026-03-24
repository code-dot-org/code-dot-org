/**
 * @vitest-environment jsdom
 */

import {SiteConfig} from '../SiteConfig';

describe('SiteConfig', () => {
  let siteConfig: SiteConfig;

  beforeEach(() => {
    // Remove any meta tag added by previous tests
    document
      .querySelectorAll('meta[name="app-config"]')
      .forEach(el => el.remove());

    siteConfig = new SiteConfig();
  });

  it('should parse the host correctly', () => {
    expect(siteConfig.host).toBeDefined();
  });

  it('should determine the brand from hostname', () => {
    expect(siteConfig.brand).toBeDefined();
  });

  it('should determine the environment from hostname', () => {
    expect(siteConfig.environment).toBeDefined();
  });

  it('should determine the dashboard API URL', () => {
    expect(siteConfig.dashboardApiUrl).toBeDefined();
  });

  describe('observability — absent meta tag', () => {
    it('defaults rumProvider to "none"', () => {
      expect(siteConfig.observability.rumProvider).toBe('none');
    });

    it('leaves appVersion undefined', () => {
      expect(siteConfig.appVersion).toBeUndefined();
    });

    it('leaves provider sub-objects undefined', () => {
      expect(siteConfig.observability.datadog).toBeUndefined();
      expect(siteConfig.observability.newRelic).toBeUndefined();
      expect(siteConfig.observability.sentry).toBeUndefined();
    });
  });

  describe('observability — valid meta tag JSON', () => {
    beforeEach(() => {
      const meta = document.createElement('meta');
      meta.name = 'app-config';
      meta.content = JSON.stringify({
        appVersion: '1.2.3',
        observability: {
          rumProvider: 'datadog',
          datadog: {applicationId: 'app-id', clientToken: 'token'},
        },
      });
      document.head.appendChild(meta);
    });

    it('populates appVersion', () => {
      const config = new SiteConfig();
      expect(config.appVersion).toBe('1.2.3');
    });

    it('populates rumProvider', () => {
      const config = new SiteConfig();
      expect(config.observability.rumProvider).toBe('datadog');
    });

    it('populates datadog sub-object', () => {
      const config = new SiteConfig();
      expect(config.observability.datadog).toEqual({
        applicationId: 'app-id',
        clientToken: 'token',
      });
    });
  });

  describe('observability — invalid JSON falls back to defaults', () => {
    beforeEach(() => {
      const meta = document.createElement('meta');
      meta.name = 'app-config';
      meta.content = 'not valid json {{{';
      document.head.appendChild(meta);
    });

    it('defaults rumProvider to "none"', () => {
      const config = new SiteConfig();
      expect(config.observability.rumProvider).toBe('none');
    });

    it('leaves appVersion undefined', () => {
      const config = new SiteConfig();
      expect(config.appVersion).toBeUndefined();
    });
  });
});
