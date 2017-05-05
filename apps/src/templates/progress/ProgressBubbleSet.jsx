/**
 * An ordered set of progress bubbles.
 */

import React, { PropTypes } from 'react';
import Radium from 'radium';
import ProgressBubble from './ProgressBubble';
import ProgressPill from './ProgressPill';
import color from "@cdo/apps/util/color";
import { getIconForLevel } from './progressHelpers';
import i18n from '@cdo/locale';
import { levelType } from './progressTypes';

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
  container: {
    position: 'relative',
  },
  pillContainer: {
    // Vertical padding is so that this lines up with other bubbles
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 2
  }
};

const ProgressBubbleSet = React.createClass({
  propTypes: {
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object,
  },

  render() {
    const { levels, disabled, style } = this.props;

    return (
      <div style={{...styles.main, ...style}}>
        {levels.map((level, index) => {
          const displayPill = level.isUnplugged || level.isGoBeyond;
          return (
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
              <div
                style={{
                  ...styles.container,
                  ...(level.isUnplugged && styles.pillContainer)
                }}
              >
                {displayPill ?
                  <ProgressPill
                    url={level.url}
                    status={level.status}
                    text={level.isGoBeyond ? i18n.goBeyond() : i18n.unpluggedActivity()}
                    fontSize={12}
                  /> :
                  <ProgressBubble
                    number={level.levelNumber}
                    status={level.status}
                    url={level.url}
                    disabled={disabled}
                    levelName={level.name || level.progression}
                    levelIcon={getIconForLevel(level)}
                  />
                }
              </div>
            </div>
          );
        })}
      </div>
    );
  }
});

export default Radium(ProgressBubbleSet);
