import {createTheme, SimplePaletteColorOptions, Theme} from '@mui/material';

import CodeaiTheme from './codeai';

/**
 * Builds a brand MUI theme that only overrides the primary palette,
 * inheriting all typography and component style overrides from CodeaiTheme
 * via deep merge. Its only consumer is CodeaiAuditTheme.
 */
export function createBrandTheme(primary: SimplePaletteColorOptions): Theme {
  return createTheme(CodeaiTheme, {palette: {primary}});
}
