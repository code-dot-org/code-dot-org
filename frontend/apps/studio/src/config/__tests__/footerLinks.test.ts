/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import {CodeStudioConfig} from '@code-dot-org/core';

import {FOOTER_LINKS} from '../footerLinks';

describe('FOOTER_LINKS', () => {
  it('contains exactly six entries', () => {
    expect(FOOTER_LINKS).toHaveLength(6);
  });

  it('every entry has a non-empty id, label, and href', () => {
    for (const link of FOOTER_LINKS) {
      expect(link.id).toBeTruthy();
      expect(link.label).toBeTruthy();
      expect(link.href).toBeTruthy();
    }
  });

  it('has expected labels in order', () => {
    const labels = FOOTER_LINKS.map(l => l.label);
    expect(labels).toEqual([
      'Privacy Policy',
      'Cookie Notice',
      'Volunteer to translate our content',
      'Help and support',
      'Store',
      'Terms',
    ]);
  });

  it('external entries (help_support, store) have external:true and absolute hrefs', () => {
    const external = FOOTER_LINKS.filter(l => l.external);
    const ids = external.map(l => l.id);
    expect(ids).toEqual(['help_support', 'store']);
    for (const link of external) {
      expect(link.href).toMatch(/^https?:\/\//);
    }
  });

  it('non-external entries have external:false', () => {
    const internal = FOOTER_LINKS.filter(l => !l.external);
    expect(internal).toHaveLength(4);
    for (const link of internal) {
      expect(link.external).toBe(false);
    }
  });

  it('brand-aware hrefs match CodeStudioConfig.marketingUrl for the test environment', () => {
    const brandAwareIds = [
      'privacy',
      'cookie_notice',
      'translate',
      'tos_short',
    ];
    const paths: Record<string, string> = {
      privacy: '/privacy',
      cookie_notice: '/cookies',
      translate: '/translate',
      tos_short: '/tos',
    };
    for (const id of brandAwareIds) {
      const link = FOOTER_LINKS.find(l => l.id === id)!;
      expect(link.href).toBe(CodeStudioConfig.marketingUrl(paths[id]));
    }
  });
});
