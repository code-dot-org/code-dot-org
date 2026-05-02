/**
 * @vitest-environment jsdom
 */

import {afterEach, beforeEach, describe, expect, it} from 'vitest';

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
});

describe('SiteConfig.marketingUrl', () => {
  it('composes a marketing URL with new URL when origin is non-null', () => {
    const config = new SiteConfig();
    if (config.marketingOrigin === null) return; // skip when running locally
    const result = config.marketingUrl('/privacy');
    expect(result).toMatch(/^https?:\/\//);
    expect(result).toContain('/privacy');
  });

  it('returns the path as-is when marketingOrigin is null', () => {
    const config = new SiteConfig();
    Object.assign(config, {marketingOrigin: null});
    expect(config.marketingUrl('/privacy')).toBe('/privacy');
  });

  it('returns the origin when path is empty and marketingOrigin is non-null', () => {
    const config = new SiteConfig();
    Object.assign(config, {marketingOrigin: 'https://code.org'});
    expect(config.marketingUrl('')).toBe('https://code.org');
    expect(config.marketingUrl()).toBe('https://code.org');
  });

  it('passes an absolute URL through unchanged (new URL base is ignored)', () => {
    const config = new SiteConfig();
    Object.assign(config, {marketingOrigin: 'https://code.org'});
    const absolute = 'https://support.code.org/path';
    expect(config.marketingUrl(absolute)).toBe(absolute);
  });

  it('normalises slash via new URL (no double-slash)', () => {
    const config = new SiteConfig();
    Object.assign(config, {marketingOrigin: 'https://code.org'});
    expect(config.marketingUrl('/privacy')).toBe('https://code.org/privacy');
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
