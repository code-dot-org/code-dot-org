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
import {LIST_ITEM_OVERRIDES, LIST_OVERRIDES} from './list';
import {SVG_ICON_OVERRIDES} from './svgIcon';
import {
  TABLE_OVERRIDES,
  TABLE_ROW_OVERRIDES,
  TABLE_CELL_OVERRIDES,
  TABLE_CONTAINER_OVERRIDES,
} from './table';
import {TYPOGRAPHY_OVERRIDES} from './typography';
import {VIDEO_OVERRIDES} from './video';

export const STYLE_OVERRIDES: Components<Theme> = {
  MuiButton: BUTTON_OVERRIDES,
  MuiAccordion: ACCORDION_OVERRIDES,
  MuiAccordionDetails: ACCORDION_DETAILS_OVERRIDES,
  MuiAccordionSummary: ACCORDION_SUMMARY_OVERRIDES,
  MuiContainer: CONTAINER_OVERRIDES,
  MuiDivider: DIVIDER_OVERRIDES,
  MuiSvgIcon: SVG_ICON_OVERRIDES,
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
