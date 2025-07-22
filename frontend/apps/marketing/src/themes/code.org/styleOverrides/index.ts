import {Components, Theme} from '@mui/material/styles';

import {DIVIDER_OVERRIDES} from './divider';
import {LINK_OVERRIDES} from './link';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiDivider: DIVIDER_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
};
