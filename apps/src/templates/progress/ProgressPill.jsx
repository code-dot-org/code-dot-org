import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import FontAwesome from '../FontAwesome';
import color from '@cdo/apps/util/color';
import {levelWithProgressType} from './progressTypes';
import {levelProgressStyle, hoverStyle} from './progressStyles';
import {stringifyQueryParams} from '../../utils';
import {isLevelAssessment} from './progressHelpers';
import {connect} from 'react-redux';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BubbleShape,
  BubbleSize
} from '@cdo/apps/templates/progress/BubbleFactory';

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
    selectedSectionId: PropTypes.string,
    progressStyle: PropTypes.bool,
    onSingleLevelClick: PropTypes.func,
    // Redux
    isRtl: PropTypes.bool
  };

  getUrl() {
    const {
      levels,
      disabled,
      selectedSectionId,
      onSingleLevelClick
    } = this.props;

    const pillLinksToLevel =
      !disabled && !onSingleLevelClick && levels.length === 1;

    if (!pillLinksToLevel) {
      return;
    }

    let url = levels[0].url;

    if (selectedSectionId) {
      url += stringifyQueryParams({section_id: selectedSectionId});
    }

    return url;
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
      onSingleLevelClick
    } = this.props;

    const firstLevel = levels[0];

    const multiLevelStep = levels.length > 1;

    const url = this.getUrl();

    let onClick =
      !multiLevelStep && !disabled && !url
        ? () => onSingleLevelClick(firstLevel)
        : undefined;

    let style = {
      ...styles.levelPill,
      ...((url || onClick) && hoverStyle),
      ...(!multiLevelStep &&
        levelProgressStyle(firstLevel.status, firstLevel.kind))
    };

    // Adjust icon margins if locale is RTL
    const iconMarginStyle = isRtl ? styles.iconMarginRTL : styles.iconMargin;

    const tooltipProps = this.getTooltipProps();

    const hasKeepWorkingFeedback =
      firstLevel['teacherFeedbackReviewState'] === ReviewStates.keepWorking;

    // Only put the bubble badge on if its a single assessment level (not set)
    const displayBadge =
      !multiLevelStep &&
      (hasKeepWorkingFeedback || isLevelAssessment(firstLevel));

    const textStyle = progressStyle ? styles.textProgressStyle : styles.text;

    return (
      <a
        href={url}
        style={{textDecoration: 'none'}}
        className="uitest-ProgressPill"
        onClick={onClick}
      >
        <div {...tooltipProps} style={style}>
          {icon && <FontAwesome icon={icon} />}
          {text && (
            <div
              className="ProgressPillTextAndIcon"
              style={{
                ...textStyle,
                ...(icon && iconMarginStyle)
              }}
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

const styles = {
  levelPill: {
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    color: color.charcoal,
    display: 'flex',
    fontSize: 16,
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
    minWidth: 70,
    lineHeight: '18px',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  text: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    letterSpacing: -0.12
  },
  textProgressStyle: {
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 12,
    letterSpacing: -0.12,
    width: 120,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  iconMargin: {
    marginLeft: 10
  },
  iconMarginRTL: {
    marginRight: 10
  }
};

export const UnconnectedProgressPill = ProgressPill;

export default connect(state => ({
  isRtl: state.isRtl
}))(Radium(ProgressPill));
