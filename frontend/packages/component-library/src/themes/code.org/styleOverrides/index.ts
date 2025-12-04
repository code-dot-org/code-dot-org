import {Components, Theme} from '@mui/material/styles';

import {LINK_OVERRIDES} from './link';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
};
