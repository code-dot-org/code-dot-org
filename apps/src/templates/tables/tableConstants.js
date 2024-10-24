import fontConstants from '@cdo/apps/fontConstants';

import styleConstants from '../../styleConstants';
import color from '../../util/color';

// Constants for React tables

// Styles for a reacttabular table
/**
 * @type {{
 *   tableText: {
 *     textOverflow?: string;
 *     overflow?: string;
 *     whiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap";
 *   };
 *   table: {
 *     borderWidth?: string;
 *     borderStyle?: string;
 *     borderColor?: string;
 *     width?: string;
 *     backgroundColor?: string,
 *   };
 *   cell: {
 *     maxWidth?: number;
 *     border?: string;
 *     borderColor?: string;
 *     padding?: number;
 *     fontSize?: number;
 *   };
 *   headerCell: {
 *     backgroundColor?: string;
 *     fontWeight?: string;
 *     borderColor?: string;
 *     borderStyle?: string;
 *     borderBottomWidth?: number;
 *     borderTopWidth?: number;
 *     borderLeftWidth?: number;
 *     borderRightWidth?: number;
 *     paddingTop?: number;
 *     paddingBottom?: number;
 *     color?: string;
 *     textAlign?: string;
 *   };
 *   flexCell: {
 *     display?: string;
 *     alignItems?: string;
 *   };
 * }}
 */
export const tableLayoutStyles = {
  tableText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.table_light_row,
  },
  cell: {
    maxWidth: 200,
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 10,
    fontSize: 14,
  },
  headerCell: {
    backgroundColor: color.table_header,
    fontWeight: 'bold',
    borderColor: color.border_light_gray,
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    color: color.charcoal,
    textAlign: 'inherit',
  },
  flexCell: {
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    textDecoration: 'none',
  },
  unsortableHeader: {
    paddingLeft: 25,
  },
  unsortableHeaderRTL: {
    paddingRight: 25,
  },
};

export const plTableLayoutStyles = {
  link: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    color: color.neutral_dark,
    textDecoration: 'underline',
  },
  sectionCodeLink: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    color: color.brand_secondary_default,
  },
  currentUnit: {
    marginTop: 10,
    fontSize: 14,
  },
  colButton: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20,
    width: 40,
  },
  participantTypeCell: {
    fontSize: 14,
  },
  leaveButton: {
    fontSize: 14,
  },
};

// Settings for WrappedSortable
export const sortableOptions = {
  // Dim inactive sorting icons in the column headers
  default: {color: 'rgba(0, 0, 0, 0.2 )'},
};

export const NAME_CELL_INPUT_WIDTH = 160;
