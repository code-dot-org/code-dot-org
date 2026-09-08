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

describe('SiteConfig with an API url the page names', () => {
  const meta = (content: string) => {
    const tag = document.createElement('meta');
    tag.name = 'cdo-api-url';
    tag.content = content;
    document.head.appendChild(tag);
    return tag;
  };

  afterEach(() => {
    document
      .querySelectorAll('meta[name="cdo-api-url"]')
      .forEach(tag => tag.remove());
  });

  it('takes the hostname’s answer when the page says nothing', () => {
    // jsdom serves localhost, so this is the development URL — and the point is
    // that nothing changed for a page without the tag.
    expect(new SiteConfig().dashboardApiUrl).toBe(
      'http://localhost-studio.code.org:3000',
    );
  });

  it('serves its own origin when asked for same-origin', () => {
    // What a mock-backed static build needs: an HTTPS page cannot request an
    // `http://localhost-studio…` subresource at all — the browser blocks it as
    // mixed content BEFORE a service worker could answer it, so the mock never
    // gets the chance and nothing loads.
    meta('same-origin');
    expect(new SiteConfig().dashboardApiUrl).toBe(window.location.origin);
  });

  it('takes a named origin as given', () => {
    meta('https://studio.example');
    expect(new SiteConfig().dashboardApiUrl).toBe('https://studio.example');
  });

  it('ignores an empty tag rather than pointing at nowhere', () => {
    meta('   ');
    expect(new SiteConfig().dashboardApiUrl).toBe(
      'http://localhost-studio.code.org:3000',
    );
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
