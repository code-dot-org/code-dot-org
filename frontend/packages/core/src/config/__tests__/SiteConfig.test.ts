/**
 * @vitest-environment jsdom
 */

import {afterEach, describe, expect, it} from 'vitest';

import {SiteConfig} from '../SiteConfig';

describe('SiteConfig', () => {
  let siteConfig: SiteConfig;

  beforeEach(() => {
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

  it('exposes a non-empty marketingOrigin', () => {
    expect(siteConfig.marketingOrigin).toBeTruthy();
  });
});

describe('SiteConfig.marketingUrl', () => {
  let siteConfig: SiteConfig;

  beforeEach(() => {
    siteConfig = new SiteConfig();
  });

  it('returns the origin when called with no argument', () => {
    expect(siteConfig.marketingUrl()).toBe(siteConfig.marketingOrigin);
  });

  it('appends a relative path to the origin', () => {
    const url = siteConfig.marketingUrl('/privacy');
    expect(url).toBe(
      new URL('/privacy', siteConfig.marketingOrigin).toString(),
    );
  });

  it('normalises a path without a leading slash', () => {
    const url = siteConfig.marketingUrl('tos');
    expect(url).toBeTruthy();
    expect(url).toContain('tos');
  });

  it('passes through an absolute URL unchanged', () => {
    const absolute = 'https://support.code.org/help';
    expect(siteConfig.marketingUrl(absolute)).toBe(absolute);
  });
});

describe('SiteConfig observability (parseRuntimeConfig)', () => {
  afterEach(() => {
    document
      .querySelectorAll('meta[name="app-config"]')
      .forEach(el => el.remove());
  });

  function setMetaConfig(content: string) {
    const meta = document.createElement('meta');
    meta.name = 'app-config';
    meta.content = content;
    document.head.appendChild(meta);
  }

  it('defaults provider to "none" when no meta tag is present', () => {
    const config = new SiteConfig();
    expect(config.observability.provider).toBe('none');
  });

  it('reads provider from the meta tag', () => {
    setMetaConfig(JSON.stringify({observability: {provider: 'sentry'}}));
    const config = new SiteConfig();
    expect(config.observability.provider).toBe('sentry');
  });

  it('reads nested sentry config from the meta tag', () => {
    setMetaConfig(
      JSON.stringify({
        observability: {
          provider: 'sentry',
          sentry: {dsn: 'https://example.sentry.io/123'},
        },
      }),
    );
    const config = new SiteConfig();
    expect(config.observability.sentry?.dsn).toBe(
      'https://example.sentry.io/123',
    );
  });

  it('defaults provider to "none" when meta content is empty', () => {
    setMetaConfig('');
    const config = new SiteConfig();
    expect(config.observability.provider).toBe('none');
  });

  it('defaults provider to "none" when meta content is invalid JSON', () => {
    setMetaConfig('not-json{');
    const config = new SiteConfig();
    expect(config.observability.provider).toBe('none');
  });
});
