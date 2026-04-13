import {CdoTheme, CodeaiTheme} from '@code-dot-org/component-library/themes';

const BRAND_CODE_ORG = 'code';
const BRAND_CODEAI = 'codeai';

export type BrandCode = typeof BRAND_CODE_ORG | typeof BRAND_CODEAI;

/**
 * Resolve the current brand from the `data-brand` attribute on `<html>`,
 * which is set server-side in application.html.haml via Cdo::Brand.
 *
 * Returns the default Code.org brand when:
 *  - the attribute is absent (default brand / DCDO flag off)
 *  - the attribute contains an unrecognised value
 */
export function getCurrentBrand(): BrandCode {
  try {
    const brand = document.documentElement.dataset.brand;
    if (brand === BRAND_CODEAI) {
      return BRAND_CODEAI;
    }
  } catch {
    // SSR or DOM access error — fall through to default
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
