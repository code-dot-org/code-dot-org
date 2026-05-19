/**
 * @vitest-environment jsdom
 */

import {describe, expect, it} from 'vitest';

import {getMarketingOrigin, MARKETING_ORIGINS} from '../getMarketingOrigin';
import type {Brand} from '../../brand/brand';
import type {Environment} from '../../environment';

const BRANDS: Brand[] = ['code.org', 'aiday'];
const ENVIRONMENTS: Environment[] = [
  'development',
  'adhoc',
  'staging',
  'test',
  'levelbuilder',
  'production',
];

describe('getMarketingOrigin', () => {
  it.each(BRANDS)(
    'returns a non-empty string for every environment (%s)',
    brand => {
      for (const env of ENVIRONMENTS) {
        expect(getMarketingOrigin(brand, env)).toBeTruthy();
      }
    },
  );

  it('matches MARKETING_ORIGINS entries exactly', () => {
    for (const brand of BRANDS) {
      for (const env of ENVIRONMENTS) {
        expect(getMarketingOrigin(brand, env)).toBe(
          MARKETING_ORIGINS[brand][env],
        );
      }
    }
  });

  it('falls back to code.org for unknown brands', () => {
    const unknownBrand = 'unknown-brand' as Brand;
    for (const env of ENVIRONMENTS) {
      expect(getMarketingOrigin(unknownBrand, env)).toBe(
        MARKETING_ORIGINS['code.org'][env],
      );
    }
  });

  it('returns production origin for production environment', () => {
    expect(getMarketingOrigin('code.org', 'production')).toBe(
      'https://code.org',
    );
    expect(getMarketingOrigin('aiday', 'production')).toBe('https://aiday.org');
  });

  it('returns pre-prod origin for staging', () => {
    expect(getMarketingOrigin('code.org', 'staging')).toBe(
      'https://code.marketing-sites.test-code.org',
    );
    expect(getMarketingOrigin('aiday', 'staging')).toBe(
      'https://aiday.marketing-sites.test-code.org',
    );
  });
});
