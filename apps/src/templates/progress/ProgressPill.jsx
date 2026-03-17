import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BubbleShape,
  BubbleSize,
  getBubbleUrl,
} from '@cdo/apps/templates/progress/BubbleFactory';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import {isLevelAssessment} from './progressHelpers';
import {levelProgressStyle, hoverStyle} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

import moduleStyles from './progress-pill.module.scss';

/**
 * This component is similar to our ProgressBubble, except that instead of being
 * a circle with a number inside, it is an ellipse with text (and possibly an
 * icon)
 */
class ProgressPill extends React.Component {
  static propTypes = {
    levels: PropTypes.arrayOf(levelWithProgressType),
    icon: PropTypes.string,
    text: PropTypes.string,
    tooltip: PropTypes.element,
    disabled: PropTypes.bool,
    selectedSectionId: PropTypes.number,
    progressStyle: PropTypes.bool,
    onSingleLevelClick: PropTypes.func,
    // Redux
    isRtl: PropTypes.bool,
  };

  getUrl() {
    const {levels, disabled, selectedSectionId, onSingleLevelClick} =
      this.props;

    const pillLinksToLevel =
      !disabled && !onSingleLevelClick && levels.length === 1;

    if (!pillLinksToLevel) {
      return;
    }

    const userId = queryParams('user_id');
    return getBubbleUrl(levels[0].url, userId, selectedSectionId);
  }

  getTooltipProps() {
    const {tooltip} = this.props;

    const tooltipProps = {};
    if (tooltip) {
      const id = tooltip.props.tooltipId;
      tooltipProps['data-tip'] = true;
      tooltipProps['data-for'] = id;
      tooltipProps['aria-describedby'] = id;
    }

    return tooltipProps;
  }

  render() {
    const {
      levels,
      icon,
      text,
      tooltip,
      disabled,
      progressStyle,
      isRtl,
      onSingleLevelClick,
    } = this.props;

    const firstLevel = levels[0];

    const multiLevelStep = levels.length > 1;

    const url = this.getUrl();

    let onClick =
      !multiLevelStep && !disabled && !url
        ? () => onSingleLevelClick(firstLevel)
        : undefined;

    const isHovered = this.state && this.state.isHovered;
    const hoverRules =
      hoverStyle && (hoverStyle[':hover'] ? hoverStyle[':hover'] : hoverStyle);

    const dynamicStyle = {
      ...((url || onClick) && isHovered && hoverRules),
      ...(!multiLevelStep &&
        levelProgressStyle(firstLevel.status, firstLevel.kind)),
    };

    // Adjust icon margins if locale is RTL
    const iconMarginClass = isRtl
      ? moduleStyles.iconMarginRTL
      : moduleStyles.iconMargin;

    const tooltipProps = this.getTooltipProps();

    const hasKeepWorkingFeedback =
      firstLevel['teacherFeedbackReviewState'] === ReviewStates.keepWorking;

    // Only put the bubble badge on if its a single assessment level (not set)
    const displayBadge =
      !multiLevelStep &&
      (hasKeepWorkingFeedback || isLevelAssessment(firstLevel));

    const textClass = progressStyle
      ? moduleStyles.textProgressStyle
      : moduleStyles.text;

    return (
      <a
        href={url}
        style={{textDecoration: 'none'}}
        className="uitest-ProgressPill"
        onClick={onClick}
        aria-label={`Level ${text}`}
      >
        <div
          {...tooltipProps}
          className={moduleStyles.levelPill}
          style={dynamicStyle}
          onMouseEnter={() => this.setState({isHovered: true})}
          onMouseLeave={() => this.setState({isHovered: false})}
        >
          {icon && <FontAwesome icon={icon} />}
          {text && (
            <div
              className={`ProgressPillTextAndIcon ${textClass}${
                icon ? ` ${iconMarginClass}` : ''
              }`}
            >
              {text}
            </div>
          )}
          {tooltip}
          {displayBadge && (
            <BubbleBadge
              badgeType={
                hasKeepWorkingFeedback
                  ? BadgeType.keepWorking
                  : BadgeType.assessment
              }
              bubbleSize={BubbleSize.full}
              bubbleShape={BubbleShape.pill}
            />
          )}
        </div>
      </a>
    );
  }
}

export const UnconnectedProgressPill = ProgressPill;

export default connect(state => ({
  isRtl: state.isRtl,
}))(ProgressPill);
