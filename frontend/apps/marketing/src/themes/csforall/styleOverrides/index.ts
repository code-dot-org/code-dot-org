import {Components, Theme} from '@mui/material/styles';

import {
  ACCORDION_DETAILS_OVERRIDES,
  ACCORDION_OVERRIDES,
  ACCORDION_SUMMARY_OVERRIDES,
} from './accordion';
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
import {LIST_ITEM_OVERRIDES, LIST_OVERRIDES} from './list';
import {
  TABLE_OVERRIDES,
  TABLE_CELL_OVERRIDES,
  TABLE_ROW_OVERRIDES,
  TABLE_CONTAINER_OVERRIDES,
} from './table';
import {TYPOGRAPHY_OVERRIDES} from './typography';
import {VIDEO_OVERRIDES} from './video';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiAccordion: ACCORDION_OVERRIDES,
  MuiAccordionSummary: ACCORDION_SUMMARY_OVERRIDES,
  MuiAccordionDetails: ACCORDION_DETAILS_OVERRIDES,
  MuiButton: BUTTON_OVERRIDES,
  MuiCard: CARD_OVERRIDES,
  MuiCardContent: CARD_CONTENT_OVERRIDES,
  MuiCardActions: CARD_ACTIONS_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiFooter: FOOTER_OVERRIDES,
  MuiImage: IMAGE_OVERRIDES,
  MuiLink: LINK_OVERRIDES,
  MuiList: LIST_OVERRIDES,
  MuiListItem: LIST_ITEM_OVERRIDES,
  MuiTable: TABLE_OVERRIDES,
  MuiTableCell: TABLE_CELL_OVERRIDES,
  MuiTableRow: TABLE_ROW_OVERRIDES,
  MuiTableContainer: TABLE_CONTAINER_OVERRIDES,
  MuiTypography: TYPOGRAPHY_OVERRIDES,
  MuiVideo: VIDEO_OVERRIDES,
};
