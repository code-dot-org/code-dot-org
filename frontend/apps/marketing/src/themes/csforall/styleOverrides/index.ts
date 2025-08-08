import {Components, Theme} from '@mui/material/styles';

import {BUTTON_OVERRIDES} from './button';
import {
  CARD_OVERRIDES,
  CARD_CONTENT_OVERRIDES,
  CARD_ACTIONS_OVERRIDES,
} from './card';
import {CONTAINER_OVERRIDES} from './container';
import {DIVIDER_OVERRIDES} from './divider';
import {FOOTER_OVERRIDES} from './footer';
import {IMAGE_OVERRIDES} from './image';
import {LINK_OVERRIDES} from './link';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiButton: BUTTON_OVERRIDES,
  MuiCard: CARD_OVERRIDES,
  MuiCardContent: CARD_CONTENT_OVERRIDES,
  MuiCardActions: CARD_ACTIONS_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiFooter: FOOTER_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
};
