import color from "../../util/color";

export const ROW_HEIGHT = 40;
export const NAME_COLUMN_WIDTH = 150;
export const MAX_TABLE_SIZE = 680;

export const progressStyles = {
  lessonHeading: {
    fontFamily: '"Gotham 5r", sans-serif',
  },
  lessonNumberHeading: {
    margin: '9px 16px',
    fontFamily: '"Gotham 5r", sans-serif',
  },
  multigrid: {
    border: '1px solid',
    borderColor: color.border_gray,
  },
  bottomLeft: {
    borderRight: '2px solid',
    borderColor: color.border_gray,
  },
  topLeft: {
    borderBottom: '2px solid',
    borderRight: '2px solid',
    borderColor: color.border_gray,
    padding: '8px 10px',
    backgroundColor: color.table_header,
  },
  topRight: {
    borderBottom: '2px solid',
    borderRight: '1px solid',
    borderColor: color.border_gray,
    backgroundColor: color.table_header,
  },
  icon: {
    padding: '3px 10px',
    width: 38,
    fontSize: 20,
  },
  link: {
    color: color.teal,
  },
  summaryCell: {
    margin: '8px 12px',
  },
  nameCell: {
    margin: 10,
  },
  cell: {
    borderRight: '1px solid',
    borderColor: color.border_gray,
  }
};
