/**
 * Brand is a website asset (not a URL). Brand is detected in the `withBrand` middleware.
 *
 * The string value is URL encoded, so don't use spaces or other special characters that are URL encoded.
 */
export enum Brand {
  CODE_DOT_ORG = 'Code.org', // Not a URL
  HOUR_OF_CODE = 'HOC',
  CS_FOR_ALL = 'CSForAll',
}

/**
 * Extracts the top-level subdomain from a hostname.
 * @param hostname - The hostname from which to extract the top-level subdomain.
 */
function getTopLevelSubdomain(hostname: string | null): string | null {
  if (!hostname) {
    return null;
  }

  // A hostname could be `code.marketing-sites.dev-code.org`
  // In this case, extract the top-level subdomain, which is `code`
  const parts = hostname.split('.');
  return parts.length > 2 ? parts[0] : null;
}

/**
 * Returns the brand based on the top-level subdomain of the hostname.
 * @param hostname - The hostname from which to determine the brand.
 */
function getBrandFromTopLevelSubdomain(
  hostname: string | null,
): Brand | undefined {
  const topLevelSubdomain = getTopLevelSubdomain(hostname);

  switch (topLevelSubdomain) {
    case 'preview-csforall':
    case 'csforall':
      return Brand.CS_FOR_ALL;
    case 'preview-hourofcode':
    case 'hourofcode':
      return Brand.HOUR_OF_CODE;
    default:
      return undefined;
  }
}

/**
 * Returns the brand based on an exact match of the hostname.
 * @param hostname - The hostname to check for an exact match.
 */
function getBrandFromExactHostname(hostname: string | null): Brand | undefined {
  switch (hostname) {
    case 'localhost.hourofcode.com:3001':
    case 'hourofcode.com':
      return Brand.HOUR_OF_CODE;
    case 'csforall.org':
      return Brand.CS_FOR_ALL;
    default:
      return undefined;
  }
}

/**
 * Returns the brand based on the hostname.
 * @param hostname - The hostname to determine the brand from.
 */
export function getBrandFromHostname(hostname: string | null) {
  return (
    getBrandFromExactHostname(hostname) ||
    getBrandFromTopLevelSubdomain(hostname) ||
    Brand.CODE_DOT_ORG
  );
}
