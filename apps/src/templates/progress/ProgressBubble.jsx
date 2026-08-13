import PropTypes from 'prop-types';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import i18n from '@cdo/locale';

import BubbleBadge, {BadgeType} from './BubbleBadge';
import {
  BasicBubble,
  BubbleLink,
  BubbleSize,
  BubbleTooltip,
  getBubbleClassNames,
  getBubbleContent,
  getBubbleShape,
  getBubbleUrl,
} from './BubbleFactory';
import {isLevelAssessment, isLevelStatusCompleted} from './progressHelpers';
import {levelProgressStyle} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

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
    selectedSectionId: PropTypes.number,
    selectedStudentId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    hideToolTips: PropTypes.bool,
    onClick: PropTypes.func,
    // We have the ability to hide the assessment star badge because
    // it's visually cluttering in places like the teacher panel and progress table
    hideAssessmentBadge: PropTypes.bool,
    lessonName: PropTypes.string,
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
    const {level, smallBubble, hideToolTips, hideAssessmentBadge} = this.props;
    const bubbleSize = smallBubble ? BubbleSize.dot : BubbleSize.full;

    // Small bubbles are too small for a corner badge, so on assessment
    // levels the whole bubble takes the badge's look instead: a black star
    // in a white circle with a black outline.
    const isAssessmentDot =
      smallBubble && isLevelAssessment(level) && !hideAssessmentBadge;

    const content = isAssessmentDot ? (
      <FontAwesome icon="star" style={styles.assessmentDotStar} />
    ) : (
      getBubbleContent(
        level.isLocked,
        level.isUnplugged,
        level.bonus,
        level.paired,
        level.bubbleText || level.letter || level.levelNumber,
        bubbleSize
      )
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
        progressStyle={
          isAssessmentDot
            ? isLevelStatusCompleted(level.status)
              ? styles.assessmentDotCompleted
              : styles.assessmentDot
            : levelProgressStyle(level.status)
        }
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
    const level = this.props.level;
    const levelID = level.bubbleText || level.letter || level.levelNumber;
    const lessonName = this.props.lessonName;
    let description = i18n.progressBubbleDescription({
      levelID: levelID,
    });
    if (lessonName) {
      description = i18n.progressBubbleDescriptionWithLesson({
        levelID: levelID,
        lessonName: lessonName,
      });
    }
    if (this.isClickable()) {
      return (
        <BubbleLink
          url={this.getUrl()}
          onClick={this.onClickLevel}
          a11y_description={description}
        >
          {this.createBubbleElement()}
        </BubbleLink>
      );
    } else {
      return this.createBubbleElement();
    }
  }
}

// A black star on a white fill, with the same gray outline as other
// not-yet-completed small bubbles. Once the assessment is completed, the
// dot fills green like other completed bubbles and the star flips to
// white. The star inherits `color` from the dot.
const styles = {
  assessmentDot: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'var(--borders-neutral-primary)',
    backgroundColor: 'var(--background-neutral-primary)',
    color: 'var(--text-neutral-primary)',
  },
  assessmentDotCompleted: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'var(--background-success-primary)',
    backgroundColor: 'var(--background-success-primary)',
    color: 'var(--text-neutral-inverse)',
  },
  assessmentDotStar: {
    fontSize: 7,
  },
};
