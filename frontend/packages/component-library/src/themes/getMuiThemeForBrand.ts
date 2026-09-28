import {Theme} from '@mui/material';

import CdoTheme from './code.org';
import CodeaiTheme from './codeai';
import CodeaiAuditTheme from './codeai-audit';

/**
 * Maps a `data-brand` attribute value to its MUI theme, so palette-driven
 * MUI components stay in sync with the CSS token brand set by
 * brandOverrides.css. Accepts the raw attribute string (rather than the
 * BrandCode union) because frontend/ has no shared brand type: callers pass
 * `document.documentElement.dataset.brand` directly.
 *
 * An absent or unrecognized brand resolves to DEFAULT_BRAND, matching what
 * Cdo::Brand serves when the DCDO flag is off. CdoTheme is reached only by
 * asking for the legacy brands by name.
 *
 * apps/src/util/brand.ts has its own getMuiThemeForBrand for the same
 * purpose in the legacy apps/ webpack workspace, which frontend/ packages
 * cannot import from. Keep the two defaults in step.
 */
export const DEFAULT_BRAND = 'codeai-next';

const BRANDS = ['code', 'codeai', 'codeai-next', 'codeai-audit'] as const;

/**
 * The CSS tokens key off the exact attribute value, so an unrecognized one
 * has to be replaced rather than merely defaulted around: write this back to
 * `data-brand` before choosing a theme, or the two layers pick different
 * brands.
 */
export function resolveBrand(brand: string | null | undefined): string {
  return BRANDS.includes(brand as (typeof BRANDS)[number])
    ? (brand as string)
    : DEFAULT_BRAND;
}

export function getMuiThemeForBrand(brand: string | undefined): Theme {
  const resolved = resolveBrand(brand);
  if (resolved === 'code' || resolved === 'codeai') {
    return CdoTheme;
  }
  if (resolved === 'codeai-audit') {
    return CodeaiAuditTheme;
  }
  return CodeaiTheme;
}
