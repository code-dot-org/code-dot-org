/**
 * An ordered set of progress bubbles.
 */
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ProgressBubble from './ProgressBubble';
import color from '@cdo/apps/util/color';
import {levelType} from './progressTypes';
import {DOT_SIZE, DIAMOND_DOT_SIZE} from './progressStyles';

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
    top: (DOT_SIZE + 4 + 6 - 10) / 2
  },
  backgroundDiamond: {
    top: (DIAMOND_DOT_SIZE + 4 + 12 - 10) / 2
  },
  backgroundPill: {
    // pill has height of 18, border of 2, padding of 6, margin of 3
    top: (18 + 4 + 12 + 6 - 10) / 2
  },
  backgroundSublevel: {
    top: 4
  },
  backgroundFirst: {
    left: 15
  },
  backgroundLast: {
    right: 15
  },
  container: {
    position: 'relative'
  },
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36
  },
  pillContainer: {
    marginRight: 2,
    // Height needed only by IE to get pill to line up properly
    height: 37
  }
};

class ProgressBubbleSet extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelType).isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object,
    //TODO: (ErinB) probably change to use just number during post launch clean-up.
    selectedSectionId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    selectedStudentId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    hideToolTips: PropTypes.bool,
    pairingIconEnabled: PropTypes.bool,
    stageExtrasEnabled: PropTypes.bool,
    hideAssessmentIcon: PropTypes.bool,
    showSublevels: PropTypes.bool
  };

  bubbleDisabled = level => {
    const {disabled, stageExtrasEnabled} = this.props;
    // Bonus level (aka stage extras) bubble is disabled if stage extras are disabled
    // for the current section.
    const disableBubble = disabled || (!stageExtrasEnabled && level.bonus);
    if (disableBubble) {
      return true;
    }
    return false;
  };

  renderBubble = (level, index, isSublevel) => {
    const {
      levels,
      selectedSectionId,
      selectedStudentId,
      hideAssessmentIcon
    } = this.props;

    return (
      <div style={styles.withBackground} key={index}>
        <div
          style={[
            styles.background,
            level.isConceptLevel && styles.backgroundDiamond,
            isSublevel && styles.backgroundSublevel,
            level.isUnplugged && styles.backgroundPill,
            !isSublevel && index === 0 && styles.backgroundFirst,
            !level.sublevels &&
              index === levels.length - 1 &&
              styles.backgroundLast
          ]}
        />
        <div
          style={[
            styles.container,
            level.isUnplugged && styles.pillContainer,
            level.isConceptLevel && styles.diamondContainer
          ]}
        >
          <ProgressBubble
            level={level}
            disabled={this.bubbleDisabled(level)}
            smallBubble={isSublevel}
            selectedSectionId={selectedSectionId}
            selectedStudentId={selectedStudentId}
            hideToolTips={this.props.hideToolTips}
            pairingIconEnabled={this.props.pairingIconEnabled}
            hideAssessmentIcon={hideAssessmentIcon}
          />
        </div>
      </div>
    );
  };

  render() {
    const {levels, style, showSublevels} = this.props;
    return (
      <div style={{...styles.main, ...style}}>
        {levels.map((level, index) => {
          return (
            <span key={index}>
              {this.renderBubble(level, index, false)}
              {showSublevels &&
                level.sublevels &&
                level.sublevels.map((sublevel, index) => {
                  return (
                    <span key={index}>
                      {this.renderBubble(sublevel, index, true)}
                    </span>
                  );
                })}
            </span>
          );
        })}
      </div>
    );
  }
}

export default Radium(ProgressBubbleSet);
