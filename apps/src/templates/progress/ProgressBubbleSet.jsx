/**
 * An ordered set of progress bubbles.
 */

import React, { PropTypes } from 'react';
import Radium from 'radium';
import ProgressBubble from './ProgressBubble';
import color from "@cdo/apps/util/color";

const styles = {
  main: {
    position: 'relative',
    display: 'inline-block'
  },
  withBackground: {
    display: 'inline-block',
    position: 'relative'
  },
  background: {
    height: 10,
    backgroundColor: color.lighter_gray,
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: (ProgressBubble.height - 10) / 2,
    marginBottom: (ProgressBubble.height - 10) / 2,
  },
  backgroundFirst: {
    left: 15
  },
  backgroundLast: {
    right: 15
  },
  bubble: {
    position: 'relative',
  }
};

const ProgressBubbleSet = React.createClass({
  propTypes: {
    start: PropTypes.number.isRequired,
    levels: PropTypes.arrayOf(
      PropTypes.shape({
        level: PropTypes.string,
        url: PropTypes.string
      })
    ).isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getIcon() {
    const { levels } = this.props;

    for (var i = 0; i < this.props.levels.length; i++) {
      if (levels[i].icon === null){
        levels[i].icon = "fa-desktop";
      }
      levels[i].icon = levels[i].icon.substring(3);
    }
  },

  render() {
    this.getIcon();

    const { start, levels, disabled } = this.props;

    return (
      <div style={styles.main}>
        {levels.map((level, index) => (
          <div
            style={styles.withBackground}
            key={index}
          >
            <div
              style={[
                styles.background,
                index === 0 && styles.backgroundFirst,
                index === levels.length - 1 && styles.backgroundLast
              ]}
            />
            <div style={{position: 'relative'}}>
              <ProgressBubble
                number={start + index}
                status={level.status}
                url={level.url}
                disabled={disabled}
                levelName={level.name}
                levelIcon={level.icon}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
});

export default Radium(ProgressBubbleSet);
