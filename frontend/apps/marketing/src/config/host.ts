import {Brand} from '@/config/brand';
import {Stage} from '@/config/stage';

const ALLOWED_PRODUCTION_CANONICAL_HOSTNAMES: {[brand in Brand]: Set<string>} =
  {
    [Brand.CODE_DOT_ORG]: new Set(['code.org', 'aiday.org']),
    [Brand.CS_FOR_ALL]: new Set(['csforall.org']),
    [Brand.HOUR_OF_CODE]: new Set(['hourofcode.com']),
  };

/**
 * Returns the localhost domain
 */
export function getLocalhostDomain() {
  const port = process.env.PORT || '3000';
  return `localhost:${port}`;
}

/**
 * Returns the localhost address based on the PORT environment variable.
 */
export function getLocalhostAddress() {
  return `http://${getLocalhostDomain()}`;
}

export function getProductionCanonicalRootDomain(brand: Brand | undefined) {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return `csforall.org`;
    case Brand.HOUR_OF_CODE:
      return `hourofcode.com`;
    case Brand.CODE_DOT_ORG:
    default:
      return `code.org`;
  }
}

function getPreproductionTopLevelSubdomain(brand: Brand) {
  switch (brand) {
    case Brand.CS_FOR_ALL:
      return `csforall`;
    case Brand.HOUR_OF_CODE:
      return `hourofcode`;
    default:
    case Brand.CODE_DOT_ORG:
      return `code`;
  }
}

export function getCanonicalHostname(brand: Brand, stage: Stage) {
  switch (stage) {
    default:
    case 'development':
    case 'pr':
      return `${getPreproductionTopLevelSubdomain(brand)}.marketing-sites.localhost`;
    case 'test':
      return `${getPreproductionTopLevelSubdomain(brand)}.marketing-sites.test-code.org`;
    case 'production':
      return getProductionCanonicalRootDomain(brand);
  }
}

export function isAllowedProductionCanonicalHostname(
  brand: Brand,
  hostname: string | null,
): boolean {
  if (hostname == null) {
    return false;
  }

  return ALLOWED_PRODUCTION_CANONICAL_HOSTNAMES[brand].has(hostname);
}
