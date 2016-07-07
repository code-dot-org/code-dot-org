import color from '../../color';

export const styles = {
  lessonPlanLink: {
    display: 'block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 10
  },
  row: {
    position: 'relative',
    boxSizing: 'border-box',
    margin: '2px 0',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    borderRadius: 5,
    background: color.lightest_gray,
    display: 'table',
    padding: 10,
    width: '100%'
  },
  focusAreaRow: {
    height: 110,
    borderWidth: 3,
    background: color.almost_white_cyan,
    borderColor: color.cyan,
    padding: '8px 8px 20px 8px'
  },
  stageName: {
    display: 'table-cell',
    width: 200,
    verticalAlign: 'middle',
    paddingRight: 10
  },
  ribbonWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    overflow: 'hidden'
  },
  ribbon: {
    fontFamily: '"Gotham 5r", sans-serif',
    position: 'absolute',
    top: 16,
    right: -31,
    fontSize: 12,
    whiteSpace: 'nowrap',
    background: color.cyan,
    color: color.white,
    padding: '5px 25px',
    transform: 'rotate(45deg)'
  },
  changeFocusArea: {
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.dark_charcoal,
    position: 'absolute',
    right: 5,
    bottom: 5
  },
  changeFocusAreaIcon: {
    fontSize: '1.2em',
    marginRight: 6
  }
};
