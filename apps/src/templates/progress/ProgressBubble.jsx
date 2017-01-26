import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from "@cdo/apps/util/color";

export const DOT_SIZE = 30;

// TODO - not sure I like these being keyed by these strings.
// TODO - share with progress_dot?
const bubbleColors = {
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
    backgroundColor: color.level_perfect
  },
  dots_disabled: {
    color: color.charcoal,
    backgroundColor: color.lightest_gray
  },
};

const styles = {
  main: {
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 12,
    letterSpacing: -0.11,
    lineHeight: DOT_SIZE + 'px',
    textAlign: 'center',
    display: 'inline-block',
    marginLeft: 3,
    marginRight: 3,
    marginTop: 5,
    marginBottom: 5,
    transition: 'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    ':hover': {
      textDecoration: 'none',
      color: color.white,
      backgroundColor: color.level_current
    }
  }
};

const ProgressBubble = React.createClass({
  propTypes: {
    number: PropTypes.number.isRequired,
    status: PropTypes.oneOf(Object.keys(bubbleColors)).isRequired,
    url: PropTypes.string
  },

  render() {
    const { number, status, url } = this.props;

    const style = {
      ...styles.main,
      ...bubbleColors[status]
    };

    return (
      <a href={url ? url + location.search : undefined}>
        <div style={style}>
          {number}
        </div>
      </a>
    );
  }
});

ProgressBubble.height = DOT_SIZE + styles.main.marginTop + styles.main.marginBottom;

export default Radium(ProgressBubble);
