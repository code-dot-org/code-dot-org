import {Components, Theme} from '@mui/material/styles';

import {
  ACCORDION_DETAILS_OVERRIDES,
  ACCORDION_OVERRIDES,
  ACCORDION_SUMMARY_OVERRIDES,
} from './accordion';
import {BUTTON_OVERRIDES} from './button';
import {CONTAINER_OVERRIDES} from './container';
import {DIVIDER_OVERRIDES} from './divider';
import {IMAGE_OVERRIDES} from './image';
import {LINK_OVERRIDES} from './link';
import {TYPOGRAPHY_OVERRIDES} from './typography';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiButton: BUTTON_OVERRIDES,
  MuiAccordion: ACCORDION_OVERRIDES,
  MuiAccordionDetails: ACCORDION_DETAILS_OVERRIDES,
  MuiAccordionSummary: ACCORDION_SUMMARY_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
};
