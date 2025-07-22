import {Components, Theme} from '@mui/material/styles';

import {BUTTON_OVERRIDES} from './button';
import {DIVIDER_OVERRIDES} from './divider';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiButton: BUTTON_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
};
