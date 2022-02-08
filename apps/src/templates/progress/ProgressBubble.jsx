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
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from './BubbleBadge';

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
    onClick: PropTypes.func,
    // We have the ability to hide the assessment checkmark badge because
    // it's visually cluttering in places like the teacher panel and progress table
    hideAssessmentBadge: PropTypes.bool
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

  renderBubbleBadge(bubbleShape, bubbleSize) {
    const {level, smallBubble, hideAssessmentBadge} = this.props;

    const hasKeepWorkingFeedback =
      level.teacherFeedbackReviewState === ReviewStates.keepWorking;

    const displayAssessmentBadge =
      isLevelAssessment(level) && !hideAssessmentBadge;

    if ((displayAssessmentBadge || hasKeepWorkingFeedback) && !smallBubble) {
      return (
        <BubbleBadge
          badgeType={
            hasKeepWorkingFeedback
              ? BadgeType.keepWorking
              : BadgeType.assessment
          }
          bubbleSize={bubbleSize}
          bubbleShape={bubbleShape}
        />
      );
    }
  }

  createBubbleElement() {
    const {level, smallBubble, hideToolTips} = this.props;
    const bubbleSize = smallBubble ? BubbleSize.dot : BubbleSize.full;

    const content = getBubbleContent(
      level.isLocked,
      level.isUnplugged,
      level.bonus,
      level.paired,
      level.bubbleText || level.letter || level.levelNumber,
      bubbleSize
    );

    const bubbleShape = getBubbleShape(
      // override pill shape for small bubbles
      level.isUnplugged && !smallBubble,
      level.isConceptLevel
    );

    const bubble = (
      <BasicBubble
        shape={bubbleShape}
        size={bubbleSize}
        progressStyle={levelProgressStyle(level.status, level.kind)}
        classNames={getBubbleClassNames(this.isClickable())}
      >
        {content}
        {this.renderBubbleBadge(bubbleShape, bubbleSize)}
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
