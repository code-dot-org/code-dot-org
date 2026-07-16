import {createTheme, SimplePaletteColorOptions, Theme} from '@mui/material';

import CdoTheme from './code.org';

/**
 * Builds a brand MUI theme that only overrides the primary palette,
 * inheriting all typography and component style overrides from CdoTheme via
 * deep merge. Shared by every brand whose theme differs from CdoTheme in
 * palette alone (CodeaiTheme, CodeaiAuditTheme, ...).
 */
export function createBrandTheme(primary: SimplePaletteColorOptions): Theme {
  return createTheme(CdoTheme, {palette: {primary}});
}
