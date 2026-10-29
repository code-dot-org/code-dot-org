import {describe, expect, it} from 'vitest';

import {getAllowedTracingTargets} from '../getAllowedTracingTargets';

const matches = (targets: Array<RegExp>, url: string): boolean =>
  targets.some(t => t.test(url));

describe('getAllowedTracingTargets', () => {
  describe('AI Gateway target', () => {
    const targets = getAllowedTracingTargets('production');

    it('matches the production AI Gateway hostname', () => {
      expect(matches(targets, 'https://ai-gateway.code.org')).toBe(true);
      expect(matches(targets, 'https://ai-gateway.code.org/generate')).toBe(
        true,
      );
    });

    it('matches Cloudflare Worker preview URLs', () => {
      expect(
        matches(targets, 'https://my-pr-ai-gateway.code-org.workers.dev'),
      ).toBe(true);
      expect(
        matches(
          targets,
          'https://my-pr-ai-gateway.code-org.workers.dev/transcribe',
        ),
      ).toBe(true);
    });

    it('matches when only a query string follows the hostname', () => {
      expect(matches(targets, 'https://ai-gateway.code.org?param=1')).toBe(
        true,
      );
    });

    it('matches when only a fragment follows the hostname', () => {
      expect(matches(targets, 'https://ai-gateway.code.org#frag')).toBe(true);
    });

    it('rejects suffix injection on the gateway hostname', () => {
      expect(
        matches(targets, 'https://ai-gateway.code.org.evil.example/'),
      ).toBe(false);
      expect(matches(targets, 'https://ai-gateway.code.org.evil.example')).toBe(
        false,
      );
    });

    it('rejects path injection masquerading as workers.dev', () => {
      expect(
        matches(targets, 'https://evil.example/path/foo.code-org.workers.dev'),
      ).toBe(false);
      expect(
        matches(targets, 'https://evil.example/foo.code-org.workers.dev/path'),
      ).toBe(false);
    });

    it('rejects userinfo bypass on the gateway hostname', () => {
      expect(
        matches(targets, 'https://ai-gateway.code.org@evil.example/'),
      ).toBe(false);
      expect(
        matches(targets, 'https://ai-gateway.code.org:80@evil.example/'),
      ).toBe(false);
    });

    it('rejects unrelated workers.dev URLs', () => {
      expect(matches(targets, 'https://other.workers.dev')).toBe(false);
    });

    it('rejects http (non-https)', () => {
      expect(matches(targets, 'http://ai-gateway.code.org')).toBe(false);
    });
  });

  describe('Dashboard target (adhoc CDN)', () => {
    const targets = getAllowedTracingTargets('adhoc');

    it('matches CDN subdomain URLs', () => {
      expect(matches(targets, 'https://foo.cdn-code.org/assets/x.js')).toBe(
        true,
      );
    });

    it('rejects suffix injection on cdn-code.org', () => {
      expect(matches(targets, 'https://foo.cdn-code.org.evil.example/')).toBe(
        false,
      );
    });

    it('rejects path injection masquerading as cdn-code.org', () => {
      expect(matches(targets, 'https://evil.example/foo.cdn-code.org')).toBe(
        false,
      );
    });
  });

  describe('Dashboard target (production)', () => {
    const targets = getAllowedTracingTargets('production');

    it('matches the dashboard hostname', () => {
      expect(matches(targets, 'https://studio.code.org')).toBe(true);
      expect(matches(targets, 'https://studio.code.org/api/foo')).toBe(true);
    });

    it('rejects suffix injection on the dashboard hostname', () => {
      expect(matches(targets, 'https://studio.code.org.evil.example/')).toBe(
        false,
      );
    });

    it('rejects substring injection via query or path', () => {
      expect(
        matches(targets, 'https://evil.example/?next=https://studio.code.org'),
      ).toBe(false);
      expect(
        matches(targets, 'https://evil.example/proxy/https://studio.code.org'),
      ).toBe(false);
    });

    it('rejects userinfo bypass on the dashboard hostname', () => {
      expect(matches(targets, 'https://studio.code.org@evil.example/')).toBe(
        false,
      );
    });
  });

  describe('Dashboard target (development with port)', () => {
    const targets = getAllowedTracingTargets('development');

    it('matches the development dashboard URL with its port', () => {
      expect(
        matches(targets, 'http://localhost-studio.code.org:3000/api/foo'),
      ).toBe(true);
    });

    it('rejects suffix injection on a port-suffixed URL', () => {
      expect(
        matches(targets, 'http://localhost-studio.code.org:3000.evil.example/'),
      ).toBe(false);
    });
  });
});
