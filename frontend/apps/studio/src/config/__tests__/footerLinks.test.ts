/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import {CodeStudioConfig as siteConfig} from '@code-dot-org/core';

import {FOOTER_LINKS} from '../footerLinks';

const EXPECTED_IDS = [
  'privacy',
  'manage_cookies',
  'help_support',
  'store',
  'tos_short',
];

describe('FOOTER_LINKS', () => {
  it('contains all expected link ids in order', () => {
    expect(FOOTER_LINKS.map(l => l.id)).toEqual(EXPECTED_IDS);
  });

  it('marks help_support and store as external', () => {
    const externalIds = FOOTER_LINKS.filter(l => l.external).map(l => l.id);
    expect(externalIds).toEqual(['help_support', 'store']);
  });

  it('non-external links have no external flag', () => {
    const nonExternal = FOOTER_LINKS.filter(l => !l.external);
    expect(nonExternal.length).toBeGreaterThan(0);
    for (const link of nonExternal) {
      expect(link.external).toBeFalsy();
    }
  });

  it('marketing-url entries resolve against the test-environment origin', () => {
    const marketingIds = ['privacy', 'manage_cookies', 'tos_short'];
    for (const id of marketingIds) {
      const link = FOOTER_LINKS.find(l => l.id === id)!;
      const path =
        id === 'manage_cookies' ? 'cookies' : id === 'tos_short' ? 'tos' : id;
      expect(link.href).toBe(siteConfig.marketingUrl(`/${path}`));
    }
  });

  it('every link has a non-empty label and href', () => {
    for (const link of FOOTER_LINKS) {
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
    }
  });
});
