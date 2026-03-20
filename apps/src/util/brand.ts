import {CdoTheme, CodeaiTheme} from '@code-dot-org/component-library/themes';

import {environmentSpecificCookieName} from '@cdo/apps/code-studio/utils';
import DCDO from '@cdo/apps/dcdo';

const BRAND_CODE_ORG = 'code';
const BRAND_CODEAI = 'codeai';
const BRAND_COOKIE_NAME = 'brand';

export type BrandCode = typeof BRAND_CODE_ORG | typeof BRAND_CODEAI;

/**
 * Resolve the current brand from the cookie set by the server-side brand
 * router (see lib/cdo/brand.rb and application_controller#persist_brand_params).
 *
 * Returns the default Code.org brand when:
 *  - the DCDO flag `brand-router-enabled` is off
 *  - no brand cookie is present
 *  - the cookie contains an unrecognised value
 */
export function getCurrentBrand(): BrandCode {
  if (!DCDO.get('brand-router-enabled', false)) {
    return BRAND_CODE_ORG;
  }

  try {
    const cookieName = environmentSpecificCookieName(BRAND_COOKIE_NAME);
    const match = document.cookie
      .split(';')
      .map(row => row.trim())
      .find(row => row.startsWith(`${cookieName}=`));

    if (match) {
      const value = match.split('=')[1];
      if (value === BRAND_CODEAI) {
        return BRAND_CODEAI;
      }
    }
  } catch {
    // SSR or cookie access error — fall through to default
  }

  return BRAND_CODE_ORG;
}

/**
 * Return the MUI theme object for the given brand (or the current brand when
 * no argument is supplied).
 */
export function getMuiThemeForBrand(brand?: BrandCode) {
  const resolved = brand ?? getCurrentBrand();
  return resolved === BRAND_CODEAI ? CodeaiTheme : CdoTheme;
}
