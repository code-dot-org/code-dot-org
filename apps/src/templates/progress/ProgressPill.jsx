import React, { PropTypes } from 'react';
import Radium from 'radium';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';

import { BUBBLE_COLORS } from '@cdo/apps/code-studio/components/progress/ProgressDot';

const styles = {
  levelPill: {
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
    minWidth: 60
  },
  hoverStyle: {
    ':hover': {
      textDecoration: 'none',
      color: color.white,
      backgroundColor: color.level_current
    }
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12,
    marginLeft: 10
  },
};

/**
 * This component is similar to our ProgressBubble, except that instead of being
 * a circle with a number inside, it is an ellipse with text (and possibly an
 * icon)
 */
const ProgressPill = React.createClass({
  propTypes: {
    url: PropTypes.string,
    status: PropTypes.string.isRequired,
    icon: PropTypes.string,
    text: PropTypes.string,
    fontSize: PropTypes.number
  },

  render() {
    const { url, status, icon, text, fontSize } = this.props;

    return (
      <a href={url}>
        <div
          style={{
            ...styles.levelPill,
            ...BUBBLE_COLORS[status],
            ...(url && styles.hoverStyle)
          }}
        >
          {icon && <FontAwesome icon={icon}/>}
          {text && (
            <div
              style={{
                ...styles.text,
                fontSize
              }}
            >
              {text}
            </div>
          )}
        </div>
      </a>
    );
  }
});

export default Radium(ProgressPill);
