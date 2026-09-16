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
 * apps/src/util/brand.ts has its own getMuiThemeForBrand for the same
 * purpose in the legacy apps/ webpack workspace, which frontend/ packages
 * cannot import from.
 */
export function getMuiThemeForBrand(brand: string | undefined): Theme {
  if (brand === 'codeai-next') {
    return CodeaiTheme;
  }
  if (brand === 'codeai-audit') {
    return CodeaiAuditTheme;
  }
  return CdoTheme;
}
