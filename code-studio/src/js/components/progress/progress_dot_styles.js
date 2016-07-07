import color from '../../color';

export function createOutline(color) {
  return `
    ${color} 0 1px,
    ${color} 1px 1px,
    ${color} 1px 0px,
    ${color} 1px -1px,
    ${color} 0 -1px,
    ${color} -1px -1px,
    ${color} -1px 0,
    ${color} -1px 1px`;
}

const dotSize = 24;
export const styles = {
  outer: {
    color: color.purple
  },
  levelName: {
    display: 'table-cell',
    paddingLeft: 5,
    fontFamily: '"Gotham 4r", sans-serif'
  },
  dot: {
    puzzle: {
      display: 'inline-block',
      width: dotSize,
      height: dotSize,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: dotSize + 'px',
      borderRadius: dotSize,
      borderWidth: 2,
      borderStyle: 'solid',
      borderColor: color.lighter_gray,
      margin: '0 2px',
      transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
      ':hover': {
        textDecoration: 'none',
        color: color.white,
        backgroundColor: color.level_current
      }
    },
    unplugged: {
      width: 'auto',
      fontSize: 13,
      padding: '0 10px'
    },
    assessment: {
      borderColor: color.assessment
    },
    small: {
      width: 7,
      height: 7,
      borderRadius: 7,
      lineHeight: 'inherit',
      verticalAlign: 'middle',
      fontSize: 0
    },
    overview: {
      height: 30,
      width: 30,
      margin: '2px 4px',
      fontSize: 16,
      lineHeight: '32px'
    },
    icon: {
      borderColor: 'transparent',
      fontSize: 24,
      verticalAlign: -4,
      color: color.white,
      textShadow: createOutline(color.lighter_gray),
      ':hover': {
        color: color.white,
        backgroundColor: 'transparent'
      }
    },
    icon_small: {
      width: 9,
      height: 9,
      borderWidth: 0,
      fontSize: 10,
      verticalAlign: 2
    },
    icon_complete: {
      color: color.light_gray,
      textShadow: createOutline(color.white),
      ':hover': {
        color: color.light_gray
      }
    }
  },
  status: {
    submitted: {
      color: color.white,
      backgroundColor: color.level_submitted
    },
    perfect: {
      color: color.white,
      backgroundColor: color.level_perfect
    },
    passed: {
      color: color.white,
      backgroundColor: color.level_passed
    },
    attempted: {
      color: color.charcoal,
      backgroundColor: color.level_attempted
    },
    not_tried: {
      color: color.charcoal,
      backgroundColor: color.level_not_tried
    },
    review_rejected: {
      color: color.white,
      backgroundColor: color.level_review_rejected
    },
    review_accepted: {
      color: color.white,
      backgroundColor: color.level_review_accepted
    }
  }
};
