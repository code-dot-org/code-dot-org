import React, { PropTypes } from 'react';
import Radium from 'radium';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';
import { levelType } from './progressTypes';
import { levelProgressStyle, hoverStyle } from './progressStyles';

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
  // Override some styles when progressBubbles is enabled so that it has a
  // similar style to bubbles, and lines up properly
  levelPillNew: {
    borderWidth: 2,
    paddingTop: 3,
    paddingBottom: 3,
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 14,
    letterSpacing: -0.12,
  },
  iconMargin: {
    marginLeft: 10
  }
};

/**
 * This component is similar to our ProgressBubble, except that instead of being
 * a circle with a number inside, it is an ellipse with text (and possibly an
 * icon)
 */
const ProgressPill = React.createClass({
  propTypes: {
    levels: PropTypes.arrayOf(levelType),
    icon: PropTypes.string,
    text: PropTypes.string,
    fontSize: PropTypes.number
  },

  render() {
    const { levels, icon, text, fontSize } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep ? undefined : levels[0].url;
    const status = multiLevelStep ? 'multi_level' : levels[0].status;

    let style = {
      ...styles.levelPill,
      ...BUBBLE_COLORS[status],
      ...(url && hoverStyle)
    };

    if (experiments.isEnabled('progressBubbles')) {
      style = {
        ...style,
        ...styles.levelPillNew,
        ...(!multiLevelStep && levelProgressStyle(levels[0]))
      };
    }

    return (
      <a href={url}>
        <div
          style={style}
        >
          {icon && <FontAwesome icon={icon}/>}
          {text && (
            <div
              style={{
                ...styles.text,
                fontSize,
                ...(icon && styles.iconMargin)
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
