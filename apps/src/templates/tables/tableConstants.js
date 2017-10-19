import color from "../../util/color";
import styleConstants from "../../styleConstants";

// Constants for React tables

// Styles for a reacttabular table
export const tableLayoutStyles = {
  table: {
    width: styleConstants['content-width'],
    borderRadius: 5,
    color: color.charcoal,
    backgroundColor: color.table_light_row
  },
  cell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 10,
    fontSize: 14,
  },
  headerCell: {
    border: '1px solid',
    borderColor: color.border_light_gray,
    padding: 20,
    backgroundColor: color.lightest_gray,
    color: color.charcoal
  },
  cellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
  },
  headerCellFirst: {
    borderWidth: '1px 0px 1px 1px',
    borderColor: color.border_light_gray,
  },
  link: {
    color: color.teal,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    textDecoration: 'none'
  },
};
