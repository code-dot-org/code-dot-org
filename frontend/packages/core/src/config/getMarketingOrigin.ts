import type {Brand} from '../brand/brand';
import type {Environment} from '../environment';

/**
 * Per-brand, per-environment marketing-site origins.
 * Pre-prod (staging, test) use `[brand].marketing-sites.test-code.org`
 * where brand is the short name: `code` for code.org, `aiday` for aiday.
 * adhoc and levelbuilder map to production: no per-adhoc/levelbuilder
 * marketing deployment exists.
 */
export const MARKETING_ORIGINS: Record<Brand, Record<Environment, string>> = {
  'code.org': {
    development: 'http://localhost.code.org:3000',
    adhoc: 'https://code.org',
    staging: 'https://code.marketing-sites.test-code.org',
    test: 'https://code.marketing-sites.test-code.org',
    levelbuilder: 'https://code.org',
    production: 'https://code.org',
  },
  aiday: {
    development: 'http://localhost.aiday.org:3000',
    adhoc: 'https://aiday.org',
    staging: 'https://aiday.marketing-sites.test-code.org',
    test: 'https://aiday.marketing-sites.test-code.org',
    levelbuilder: 'https://aiday.org',
    production: 'https://aiday.org',
  },
};

/**
 * Return the marketing-site origin for the given brand and environment.
 * Falls back to the code.org origin for unknown brands so future Brand
 * union expansions don't crash before this map is updated.
 */
export function getMarketingOrigin(
  brand: Brand,
  environment: Environment,
): string {
  const origins = MARKETING_ORIGINS[brand] ?? MARKETING_ORIGINS['code.org'];
  return origins[environment];
}
