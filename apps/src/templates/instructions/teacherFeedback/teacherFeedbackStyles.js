import color from '@cdo/apps/util/color';
import fontConstants from '@cdo/apps/fontConstants';

const teacherFeedbackStyles = {
  footer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    paddingBottom: 8,
  },
  h1: {
    color: color.charcoal,
    fontSize: 18,
    lineHeight: '18px',
    ...fontConstants['main-font-semi-bold'],
  },
  commentAndFooter: {
    padding: '8px 16px',
  },
  timestamp: {
    ...fontConstants['main-font-bold'],
  },
};

export default teacherFeedbackStyles;
