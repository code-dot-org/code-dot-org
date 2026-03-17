import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {connect} from 'react-redux';

import {queryParams} from '@cdo/apps/code-studio/utils';
import fontConstants from '@cdo/apps/fontConstants';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import BubbleBadge, {BadgeType} from '@cdo/apps/templates/progress/BubbleBadge';
import {
  BubbleShape,
  BubbleSize,
  getBubbleUrl,
} from '@cdo/apps/templates/progress/BubbleFactory';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import FontAwesome from '../../legacySharedComponents/FontAwesome';

import ProgressBubbleSet from './ProgressBubbleSet';
import {getIconForLevel, isLevelAssessment} from './progressHelpers';
import {levelProgressStyle, hoverStyle} from './progressStyles';
import {levelWithProgressType} from './progressTypes';

/**
 * A set of one or more levels that are part of the same progression
 */
class ProgressLevelSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    lessonName: PropTypes.string,
    levels: PropTypes.arrayOf(levelWithProgressType).isRequired,
    disabled: PropTypes.bool.isRequired,
    selectedSectionId: PropTypes.number,
    onBubbleClick: PropTypes.func,
    // Redux
    isRtl: PropTypes.bool,
  };

  render() {
    const {
      name,
      levels,
      disabled,
      selectedSectionId,
      onBubbleClick,
      isRtl,
      lessonName,
    } = this.props;

    const multiLevelStep = levels.length > 1;
    const url = multiLevelStep || onBubbleClick ? undefined : levels[0].url;
    const onClick = multiLevelStep ? undefined : () => onBubbleClick(levels[0]);

    // Adjust column styles if locale is RTL
    const col2Style = isRtl ? styles.col2RTL : styles.col2;

    let pillText, icon;
    let progressStyle = false;
    if (levels[0].isUnplugged || levels[levels.length - 1].isUnplugged) {
      // We explicitly don't want any text in this case
      if (multiLevelStep) {
        pillText = '';
        icon = getIconForLevel(levels[0]);
      } else {
        pillText = i18n.unpluggedActivity();
        progressStyle = true;
      }
    } else {
      pillText = levels[0].levelNumber.toString();
      icon = getIconForLevel(levels[0]);
      if (multiLevelStep) {
        pillText += `-${levels[levels.length - 1].levelNumber}`;
      }
    }

    // Pill rendering (inlined from ProgressPill)
    const userId = queryParams('user_id');
    const pillLinksToLevel =
      !disabled && !onBubbleClick && levels.length === 1;
    const pillUrl = pillLinksToLevel
      ? getBubbleUrl(levels[0].url, userId, selectedSectionId)
      : undefined;
    const pillOnClick =
      !multiLevelStep && !disabled && !pillUrl
        ? () => onBubbleClick(levels[0])
        : undefined;

    const firstLevel = levels[0];
    const pillStyle = {
      ...pillStyles.levelPill,
      ...((pillUrl || pillOnClick) ? hoverStyle : {}),
      ...(!multiLevelStep
        ? levelProgressStyle(firstLevel.status, firstLevel.kind)
        : {}),
    };

    const iconMarginStyle = isRtl
      ? pillStyles.iconMarginRTL
      : pillStyles.iconMargin;
    const textStyle = progressStyle
      ? pillStyles.textProgressStyle
      : pillStyles.text;

    const hasKeepWorkingFeedback =
      firstLevel['teacherFeedbackReviewState'] === ReviewStates.keepWorking;
    const displayBadge =
      !multiLevelStep &&
      (hasKeepWorkingFeedback || isLevelAssessment(firstLevel));

    return (
      <table style={styles.table}>
        <tbody>
          <tr>
            <td style={styles.col1}>
              <a
                href={pillUrl}
                style={{textDecoration: 'none'}}
                className="uitest-ProgressPill"
                onClick={pillOnClick}
                aria-label={`Level ${pillText}`}
              >
                <div style={pillStyle}>
                  {icon && <FontAwesome icon={icon} />}
                  {pillText && (
                    <div
                      className="ProgressPillTextAndIcon"
                      style={{
                        ...textStyle,
                        ...(icon ? iconMarginStyle : {}),
                      }}
                    >
                      {pillText}
                    </div>
                  )}
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
            </td>
            <td style={col2Style}>
              <a href={url} onClick={onClick}>
                <div style={{...styles.nameText, ...styles.text}}>{name}</div>
              </a>
            </td>
          </tr>
          {multiLevelStep && (
            <tr>
              <td>
                <div style={styles.linesAndDot}>
                  <div style={styles.verticalLine} />
                  <div style={styles.horizontalLine} />
                  <div style={styles.dot} />
                </div>
              </td>
              <td style={styles.col2}>
                <ProgressBubbleSet
                  levels={levels}
                  disabled={disabled}
                  selectedSectionId={selectedSectionId}
                  onBubbleClick={onBubbleClick}
                  lessonName={lessonName}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

const styles = {
  table: {
    marginTop: 12,
  },
  nameText: {
    color: color.charcoal,
  },
  text: {
    display: 'inline-block',
    ...fontConstants['main-font-semi-bold'],
    fontSize: 14,
    letterSpacing: -0.12,
  },
  col2: {
    paddingLeft: 20,
  },
  col2RTL: {
    paddingRight: 20,
  },
  linesAndDot: {
    whiteSpace: 'nowrap',
    marginLeft: '50%',
    marginRight: 14,
  },
  verticalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    height: 15,
    width: 3,
    position: 'relative',
    bottom: 2,
  },
  horizontalLine: {
    display: 'inline-block',
    backgroundColor: color.lighter_gray,
    position: 'relative',
    top: -2,
    height: 3,
    width: '100%',
  },
  dot: {
    display: 'inline-block',
    position: 'relative',
    left: -2,
    top: 1,
    backgroundColor: color.lighter_gray,
    height: 10,
    width: 10,
    borderRadius: 10,
  },
};

const pillStyles = {
  levelPill: {
    textAlign: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    color: color.charcoal,
    display: 'flex',
    fontSize: 16,
    ...fontConstants['main-font-semi-bold'],
    borderRadius: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 6,
    paddingBottom: 6,
    minWidth: 70,
    lineHeight: '18px',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative',
  },
  text: {
    display: 'inline-block',
    ...fontConstants['main-font-semi-bold'],
    letterSpacing: -0.12,
  },
  textProgressStyle: {
    display: 'inline-block',
    ...fontConstants['main-font-semi-bold'],
    fontSize: 12,
    letterSpacing: -0.12,
    width: 120,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  iconMargin: {
    marginLeft: 10,
  },
  iconMarginRTL: {
    marginRight: 10,
  },
};

export const UnconnectedProgressLevelSet = ProgressLevelSet;

export default connect(state => ({
  isRtl: state.isRtl,
}))(Radium(ProgressLevelSet));
