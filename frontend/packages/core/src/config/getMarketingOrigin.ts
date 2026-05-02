import type {Brand} from '../brand/brand';
import type {Environment} from '../environment/environment';

/**
 * Marketing site origin, or null when no marketing site is reachable
 * (e.g., local development).
 */
export type MarketingOrigin = string | null;

/**
 * Marketing site origins keyed by brand then environment.
 * All pre-prod environments share a single marketing-sites test host;
 * local development has no reachable marketing origin (null).
 */
export const MARKETING_ORIGINS: Record<
  Brand,
  Record<Environment, MarketingOrigin>
> = {
  'code.org': {
    production: 'https://code.org',
    staging: 'https://code.marketing-sites.test-code.org',
    test: 'https://code.marketing-sites.test-code.org',
    levelbuilder: 'https://code.marketing-sites.test-code.org',
    adhoc: 'https://code.marketing-sites.test-code.org',
    development: null,
  },
  aiday: {
    production: 'https://aiday.org',
    staging: 'https://aiday.marketing-sites.test-code.org',
    test: 'https://aiday.marketing-sites.test-code.org',
    levelbuilder: 'https://aiday.marketing-sites.test-code.org',
    adhoc: 'https://aiday.marketing-sites.test-code.org',
    development: null,
  },
};

/**
 * Returns the marketing site origin for the given brand and environment,
 * or null when no marketing site is reachable.
 * Falls back to the code.org origin when brand is absent from the map.
 *
 * @param brand - The active brand identifier.
 * @param environment - The current runtime environment.
 * @returns An absolute origin string (no trailing slash), or null.
 */
export function getMarketingOrigin(
  brand: Brand,
  environment: Environment,
): MarketingOrigin {
  return (MARKETING_ORIGINS[brand] ?? MARKETING_ORIGINS['code.org'])[
    environment
  ];
}
