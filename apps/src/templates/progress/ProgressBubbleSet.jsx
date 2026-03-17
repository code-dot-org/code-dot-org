/**
 * An ordered set of progress bubbles.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import color from '@cdo/apps/util/color';

import ProgressBubble from './ProgressBubble';
import {DOT_SIZE, DIAMOND_DOT_SIZE} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

import moduleStyles from './progress-bubble-set.module.scss';

// Deprecated in favor of ProgressTableDetailCell
// component will be removed as part of https://codedotorg.atlassian.net/browse/LP-1606
class ProgressBubbleSet extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    style: PropTypes.object,
    selectedSectionId: PropTypes.number,
    selectedStudentId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    hideToolTips: PropTypes.bool,
    lessonExtrasEnabled: PropTypes.bool,
    showSublevels: PropTypes.bool,
    onBubbleClick: PropTypes.func,
    lessonName: PropTypes.string,
    // Redux
    isRtl: PropTypes.bool,
  };

  renderBubble = (level, index, isSublevel) => {
    const {levels, selectedSectionId, selectedStudentId, isRtl} = this.props;

    // Adjust background styles if locale is RTL
    const backgroundFirstStyle = isRtl
      ? inlineStyles.backgroundLast
      : inlineStyles.backgroundFirst;
    const backgroundLastStyle = isRtl
      ? inlineStyles.backgroundFirst
      : inlineStyles.backgroundLast;

    const backgroundStyleProp = {
      ...inlineStyles.background,
      ...(level.isConceptLevel && inlineStyles.backgroundDiamond),
      ...(isSublevel && inlineStyles.backgroundSublevel),
      ...(level.isUnplugged && inlineStyles.backgroundPill),
      ...(!isSublevel && index === 0 && backgroundFirstStyle),
      ...(!isSublevel &&
        !level.sublevels &&
        index === levels.length - 1 &&
        backgroundLastStyle),
    };

    const containerStyleProp = {
      ...inlineStyles.container,
      ...(level.isUnplugged && inlineStyles.pillContainer),
      ...(level.isConceptLevel && inlineStyles.diamondContainer),
      ...(isSublevel && inlineStyles.containerSublevel),
    };

    return (
      <div className={moduleStyles.withBackground} key={index}>
        <div style={backgroundStyleProp} />
        <div style={containerStyleProp}>
          <ProgressBubble
            level={level}
            disabled={this.props.disabled}
            smallBubble={isSublevel}
            selectedSectionId={selectedSectionId}
            selectedStudentId={selectedStudentId}
            hideToolTips={this.props.hideToolTips}
            onClick={this.props.onBubbleClick}
            lessonName={this.props.lessonName}
          />
        </div>
      </div>
    );
  };

  render() {
    const {levels, style, showSublevels} = this.props;
    return (
      <div className={moduleStyles.main} style={style}>
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

const inlineStyles = {
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
  backgroundSublevel: {
    top: 9,
  },
  backgroundFirst: {
    left: 15,
  },
  backgroundLast: {
    right: 15,
  },
  container: {
    position: 'relative',
  },
  containerSublevel: {
    top: 5,
  },
  diamondContainer: {
    // Height needed only by IE to get diamonds to line up properly
    height: 36,
  },
  pillContainer: {
    marginRight: 2,
    // Height needed only by IE to get pill to line up properly
    height: 37,
  },
};

export const UnconnectedProgressBubbleSet = ProgressBubbleSet;

export default connect(state => ({
  isRtl: state.isRtl,
}))(ProgressBubbleSet);
