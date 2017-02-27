import React, { PropTypes } from 'react';
import Radium from 'radium';
import color from "@cdo/apps/util/color";

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

export const DOT_SIZE = 30;

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
    status: PropTypes.oneOf(Object.keys(BUBBLE_COLORS)).isRequired,
    url: PropTypes.string
  },

  render() {
    const { number, status, url } = this.props;

    const style = {
      ...styles.main,
      ...BUBBLE_COLORS[status]
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

// Expose our height, as ProgressBubbleSet needs this to stick the little gray
// connector between bubbles
ProgressBubble.height = DOT_SIZE + styles.main.marginTop + styles.main.marginBottom;

export default Radium(ProgressBubble);
