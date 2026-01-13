import {Components, Theme} from '@mui/material/styles';

import {BUTTON_OVERRIDES} from './button';
import {ICON_BUTTON_OVERRIDES} from './iconButton';
import {LINK_OVERRIDES} from './link';
import {TYPOGRAPHY_OVERRIDES} from './typography';

const BUTTON_BASE_OVERRIDES: Components<Theme>['MuiButtonBase'] = {
  defaultProps: {
    disableRipple: true,
  },
};

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiButtonBase: BUTTON_BASE_OVERRIDES,
  MuiButton: BUTTON_OVERRIDES,
  MuiIconButton: ICON_BUTTON_OVERRIDES,
};
