/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import type {Brand} from '../../brand/brand';
import type {Environment} from '../../environment/environment';
import {getMarketingOrigin, MARKETING_ORIGINS} from '../getMarketingOrigin';

describe('MARKETING_ORIGINS', () => {
  const brands: Brand[] = ['code.org', 'aiday'];
  const environments: Environment[] = [
    'production',
    'staging',
    'test',
    'levelbuilder',
    'adhoc',
    'development',
  ];

  it.each(brands)('covers all environments for brand %s', brand => {
    const origins = MARKETING_ORIGINS[brand];
    for (const env of environments) {
      expect(origins).toHaveProperty(env);
    }
  });

  it('production entries are non-null for all brands', () => {
    for (const brand of brands) {
      expect(MARKETING_ORIGINS[brand].production).not.toBeNull();
    }
  });

  it('development entries are null (no reachable marketing site locally)', () => {
    for (const brand of brands) {
      expect(MARKETING_ORIGINS[brand].development).toBeNull();
    }
  });
});

describe('getMarketingOrigin', () => {
  it('returns code.org production origin', () => {
    expect(getMarketingOrigin('code.org', 'production')).toBe(
      'https://code.org',
    );
  });

  it('returns aiday production origin', () => {
    expect(getMarketingOrigin('aiday', 'production')).toBe('https://aiday.org');
  });

  it('returns code.org staging origin', () => {
    expect(getMarketingOrigin('code.org', 'staging')).toBe(
      'https://code.marketing-sites.test-code.org',
    );
  });

  it('returns aiday staging origin', () => {
    expect(getMarketingOrigin('aiday', 'staging')).toBe(
      'https://aiday.marketing-sites.test-code.org',
    );
  });

  it('returns null for development regardless of brand', () => {
    expect(getMarketingOrigin('code.org', 'development')).toBeNull();
    expect(getMarketingOrigin('aiday', 'development')).toBeNull();
  });

  it('falls back to code.org origin for an unknown brand', () => {
    const unknownBrand = 'unknown.org' as Brand;
    expect(getMarketingOrigin(unknownBrand, 'production')).toBe(
      MARKETING_ORIGINS['code.org'].production,
    );
  });
});
