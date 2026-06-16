import fontConstants from '@cdo/apps/fontConstants';

import styleConstants from '../../styleConstants';

// Constants for React tables

// Styles for a reacttabular table
/**
 * @type {{
 *   tableText: {
 *     textOverflow?: string;
 *     overflow?: string;
 *     whiteSpace?: "normal" | "nowrap" | "pre" | "pre-line" | "pre-wrap";
 *   };
 *   tableNameText: {
 *     textOverflow: string,
 *     overflow: string;
 *     whiteSpace: string;
 *     minWidth: number;
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
  tableNameText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: 160,
  },
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--borders-neutral-primary)',
    width: styleConstants['content-width'],
    backgroundColor: 'var(--background-neutral-primary)',
  },
  cell: {
    maxWidth: 200,
    border: '1px solid',
    borderColor: 'var(--borders-neutral-primary)',
    padding: 10,
    fontSize: 14,
    color: 'var(--text-neutral-primary)',
  },
  headerCell: {
    backgroundColor: 'var(--background-neutral-tertiary)',
    fontWeight: 'bold',
    borderColor: 'var(--borders-neutral-primary)',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 1,
    paddingTop: 20,
    paddingBottom: 20,
    color: 'var(--text-neutral-primary)',
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
    color: 'var(--text-neutral-primary)',
    textDecoration: 'underline',
  },
  sectionCodeLink: {
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    color: 'var(--text-brand-purple-primary)',
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
  default: {color: 'var(--text-neutral-tertiary)'},
};

export const NAME_CELL_INPUT_WIDTH = 160;
