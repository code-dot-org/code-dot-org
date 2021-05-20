import color from '../../util/color';
import styleConstants from '../../styleConstants';

// Constants for React tables

// Styles for a reacttabular table
export const tableLayoutStyles = {
  table: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border_gray,
    width: styleConstants['content-width'],
    backgroundColor: color.table_light_row
  },
  cell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 10,
    fontSize: 14
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
    textAlign: 'inherit'
  },
  link: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    textDecoration: 'none'
  },
  unsortableHeader: {
    paddingLeft: 25
  },
  unsortableHeaderRTL: {
    paddingRight: 25
  }
};

// Settings for WrappedSortable
export const sortableOptions = {
  // Dim inactive sorting icons in the column headers
  default: {color: 'rgba(0, 0, 0, 0.2 )'}
};
