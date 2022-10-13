import color from '@cdo/apps/util/color';

const teacherFeedbackStyles = {
  footer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    fontFamily: '"Gotham 5r", sans-serif',
    fontWeight: 'normal'
  },
  commentAndFooter: {
    padding: '8px 16px'
  },
  timestamp: {
    fontFamily: '"Gotham 7r", sans-serif'
  }
};

export default teacherFeedbackStyles;
