/**
 * An ordered set of progress bubbles.
 */

import React, { PropTypes } from 'react';
import Radium from 'radium';
import ProgressBubble from './ProgressBubble';
import color from "@cdo/apps/util/color";
import { levelType } from './progressTypes';
import { DOT_SIZE, DIAMOND_DOT_SIZE } from './progressStyles';

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
    // dot size, plus borders, plus margin, minus our height of "background"
    top: (DOT_SIZE + 4 + 6 - 10) / 2,
  },
  backgroundDiamond: {
    top: (DIAMOND_DOT_SIZE + 4 + 12 - 10) / 2,
  },
  backgroundPill: {
    // pill has height of 18, border of 2, padding of 6, margin of 3
    top: (18 + 4 + 12 + 6 - 10) / 2,
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
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36,
  },
  pillContainer: {
    marginRight: 2,
    // Height needed only by IE to get pill to line up properly
    height: 37,
  }
};

class ProgressBubbleSet extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object,
    selectedSectionId: PropTypes.string,
    hideToolTips: PropTypes.bool,
  };

  render() {
    const { levels, disabled, style, selectedSectionId } = this.props;

    return (
      <div style={{...styles.main, ...style}}>
        {levels.map((level, index) => (
          <div
            style={styles.withBackground}
            key={index}
          >
            <div
              style={[
                styles.background,
                level.isConceptLevel && styles.backgroundDiamond,
                level.isUnplugged && styles.backgroundPill,
                index === 0 && styles.backgroundFirst,
                index === levels.length - 1 && styles.backgroundLast
              ]}
            />
            <div
              style={[
                styles.container,
                level.isUnplugged && styles.pillContainer,
                level.isConceptLevel && styles.diamondContainer,
              ]}
            >
              <ProgressBubble
                level={level}
                disabled={disabled}
                smallBubble={false}
                selectedSectionId={selectedSectionId}
                hideToolTips={this.props.hideToolTips}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default Radium(ProgressBubbleSet);
