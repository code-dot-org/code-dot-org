import {
  CodeaiTheme,
  CodeaiAuditTheme,
} from '@code-dot-org/component-library/themes';

const BRAND_CODEAI_NEXT = 'codeai-next';
const BRAND_CODEAI_AUDIT = 'codeai-audit';

export type BrandCode = typeof BRAND_CODEAI_NEXT | typeof BRAND_CODEAI_AUDIT;

/**
 * Resolve the current brand from the `data-brand` attribute on `<html>`,
 * which is set server-side in application.html.haml via Cdo::Brand.
 *
 * Returns the default CodeAI Next brand when:
 *  - the attribute is absent (default brand / DCDO flag off)
 *  - the attribute contains an unrecognised value
 */
export function getCurrentBrand(): BrandCode {
  try {
    const brand = document.documentElement.dataset.brand;
    if (brand === BRAND_CODEAI_AUDIT) {
      return BRAND_CODEAI_AUDIT;
    }
  } catch {
    // SSR or DOM access error — fall through to default
  }

  return BRAND_CODEAI_NEXT;
}

/**
 * Return the MUI theme object for the given brand (or the current brand when
 * no argument is supplied).
 */
export function getMuiThemeForBrand(brand?: BrandCode) {
  const resolved = brand ?? getCurrentBrand();
  if (resolved === BRAND_CODEAI_AUDIT) {
    return CodeaiAuditTheme;
  }
  return CodeaiTheme;
}
