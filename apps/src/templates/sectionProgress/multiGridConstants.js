import color from '../../util/color';

export const ROW_HEIGHT = 42;
export const LAST_ROW_MARGIN_HEIGHT = 18;
export const NAME_COLUMN_WIDTH = 170;
export const MAX_TABLE_SIZE = 680;
export const PROGRESS_BUBBLE_WIDTH = 38;
export const DIAMOND_BUBBLE_WIDTH = 38;
export const PILL_BUBBLE_WIDTH = 180;
export const MIN_COLUMN_WIDTH = 39;

export const progressStyles = {
  lessonHeading: {
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    color: color.charcoal,
    paddingLeft: 8
  },
  lessonLabelContainer: {
    borderBottom: '2px solid',
    borderColor: color.border_gray,
    height: 44,
    display: 'flex',
    alignItems: 'center'
  },
  // For 'hover' to be applied, you should wrap the component using this style in Radium.
  lessonNumberHeading: {
    paddingTop: 9,
    paddingBotton: 9,
    paddingLeft: 11,
    paddingRight: 11,
    fontFamily: '"Gotham 5r", sans-serif',
    ':hover': {
      cursor: 'pointer'
    },
    textAlign: 'center',
    height: '100%'
  },
  lessonOfInterest: {
    backgroundColor: color.teal,
    color: color.white,
    fontSize: 18,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center'
  },
  multigrid: {
    border: '1px solid',
    borderColor: color.border_gray,
    padding: 0
  },
  bottomLeft: {
    borderRight: '2px solid',
    borderColor: color.border_gray
  },
  topLeft: {
    borderBottom: '2px solid',
    borderRight: '2px solid',
    borderColor: color.border_gray,
    backgroundColor: color.table_header
  },
  topRight: {
    borderBottom: '2px solid',
    borderRight: '1px solid',
    borderColor: color.border_gray,
    backgroundColor: color.table_header
  },
  icon: {
    paddingTop: 12,
    width: PROGRESS_BUBBLE_WIDTH,
    textAlign: 'center',
    color: color.charcoal,
    fontSize: 20
  },
  unpluggedIcon: {
    width: PILL_BUBBLE_WIDTH,
    textAlign: 'center',
    color: color.charcoal,
    fontSize: 20,
    paddingTop: 12
  },
  link: {
    color: color.teal
  },
  summaryCell: {
    margin: '9px 8px'
  },
  nameCell: {
    margin: 10,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 14
  },
  cell: {
    borderRight: `1px solid ${color.border_gray}`
  }
};

export function tooltipIdForLessonNumber(i) {
  return `tooltipForLesson${i}`;
}
