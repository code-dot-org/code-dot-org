import React from 'react';
import PropTypes from 'prop-types';
import {isLevelAssessment} from './progressHelpers';
import {levelWithProgressType} from './progressTypes';
import {
  BasicBubble,
  BubbleLink,
  BubbleSize,
  BubbleTooltip,
  getBubbleClassNames,
  getBubbleContent,
  getBubbleShape,
  getBubbleUrl
} from './BubbleFactory';
import {levelProgressStyle} from './progressStyles';
import {SmallAssessmentIcon} from './SmallAssessmentIcon';

/**
 * A ProgressBubble represents progress for a specific level. It can be a circle
 * or a diamond (or a pill in the case of unplugged levels), and it can be big
 * or small. The fill and outline change depending on the level status.
 */
export default class ProgressBubble extends React.Component {
  static propTypes = {
    level: levelWithProgressType.isRequired,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
    selectedSectionId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    selectedStudentId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    hideToolTips: PropTypes.bool,
    onClick: PropTypes.func
  };

  isClickable() {
    const {disabled, level, onClick} = this.props;
    return !disabled && (!!level.url || !!onClick);
  }

  onClickLevel = () => {
    if (this.props.onClick) {
      this.props.onClick(this.props.level);
    }
  };

  /**
   * onClick takes priority over url, so if we have onClick, return null
   */
  getUrl() {
    const {onClick, level, selectedSectionId, selectedStudentId} = this.props;
    return onClick
      ? null
      : getBubbleUrl(level.url, selectedStudentId, selectedSectionId, true);
  }

  createBubbleElement() {
    const {level, smallBubble, hideToolTips} = this.props;
    const bubbleSize = smallBubble ? BubbleSize.dot : BubbleSize.full;

    const content = getBubbleContent(
      level.isLocked,
      level.isUnplugged,
      level.bonus,
      false,
      level.bubbleText || level.letter || level.levelNumber,
      bubbleSize
    );
    const shape = getBubbleShape(
      // override pill shape for small bubbles
      level.isUnplugged && !smallBubble,
      level.isConceptLevel
    );

    const bubble = (
      <BasicBubble
        shape={shape}
        size={bubbleSize}
        progressStyle={levelProgressStyle(level.status, level.kind)}
        classNames={getBubbleClassNames(this.isClickable())}
      >
        {content}
        {isLevelAssessment(level) && !smallBubble && (
          <SmallAssessmentIcon isDiamond={level.isConceptLevel} />
        )}
      </BasicBubble>
    );

    if (hideToolTips) {
      return bubble;
    }
    return <BubbleTooltip level={level}>{bubble}</BubbleTooltip>;
  }

  render() {
    if (this.isClickable()) {
      return (
        <BubbleLink url={this.getUrl()} onClick={this.onClickLevel}>
          {this.createBubbleElement()}
        </BubbleLink>
      );
    } else {
      return this.createBubbleElement();
    }
  }
}
