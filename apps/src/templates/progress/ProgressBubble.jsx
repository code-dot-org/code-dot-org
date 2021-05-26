import React from 'react';
import Radium from 'radium';
import _ from 'lodash';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import FontAwesome from '../FontAwesome';
import {getIconForLevel, isLevelAssessment} from './progressHelpers';
import {levelWithProgressType} from './progressTypes';
import {
  DOT_SIZE,
  DIAMOND_DOT_SIZE,
  SMALL_DOT_SIZE,
  SMALL_DIAMOND_SIZE,
  levelProgressStyle,
  hoverStyle
} from './progressStyles';
import ProgressPill from '@cdo/apps/templates/progress/ProgressPill';
import TooltipWithIcon from './TooltipWithIcon';
import {SmallAssessmentIcon} from './SmallAssessmentIcon';
import firehoseClient from '../../lib/util/firehose';

class ProgressBubble extends React.Component {
  static propTypes = {
    level: levelWithProgressType.isRequired,
    disabled: PropTypes.bool.isRequired,
    smallBubble: PropTypes.bool,
    //TODO: (ErinB) probably change to use just number during post launch clean-up.
    selectedSectionId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    selectedStudentId: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    // This prop is provided as a testing hook, in normal use it will just be
    // set to window.location; see defaultProps.
    currentLocation: PropTypes.object.isRequired,
    lessonTrophyEnabled: PropTypes.bool,
    pairingIconEnabled: PropTypes.bool,
    hideToolTips: PropTypes.bool,
    hideAssessmentIcon: PropTypes.bool,
    onClick: PropTypes.func
  };

  static defaultProps = {
    currentLocation: window.location
  };

  recordProgressTabProgressBubbleClick = () => {
    firehoseClient.putRecord(
      {
        study: 'teacher_dashboard_actions',
        study_group: 'progress',
        event: 'go_to_level',
        data_json: JSON.stringify({
          student_id: this.props.selectedStudentId,
          level_url: this.props.level.url,
          section_id: this.props.selectedSectionId
        })
      },
      {includeUserId: true}
    );
  };

  render() {
    const {
      level,
      disabled,
      smallBubble,
      selectedSectionId,
      selectedStudentId,
      currentLocation,
      lessonTrophyEnabled,
      pairingIconEnabled,
      hideAssessmentIcon,
      onClick
    } = this.props;

    const levelIsAssessment = isLevelAssessment(level);

    const number = level.levelNumber;
    const url = level.url;
    const levelName = level.name || level.progressionDisplayName;
    const levelIcon = getIconForLevel(level);

    const hideNumber =
      level.letter || level.isLocked || level.paired || level.bonus;

    const style = {
      ...styles.main,
      ...(!disabled && hoverStyle),
      ...(smallBubble && styles.small),
      ...(level.isConceptLevel &&
        (smallBubble ? styles.smallDiamond : styles.largeDiamond)),
      ...levelProgressStyle(level.status, level.kind),
      ...(level.highlighted && styles.highlighted)
    };

    let href = '';
    if (!disabled && url && !onClick) {
      const queryParams = queryString.parse(currentLocation.search);

      if (selectedSectionId) {
        queryParams.section_id = selectedSectionId;
      }
      if (selectedStudentId) {
        queryParams.user_id = selectedStudentId;
      }
      const paramString = queryString.stringify(queryParams);
      href = url;
      if (paramString.length > 0) {
        // If href already has 1 or more query params, our delimiter will be '&'.
        // If href has no query params, our delimiter is '?'.
        // TODO: (madelynkasula) Refactor this logic to use queryString.parseUrl(href)
        // instead. Our current version of query-string (4.1.0) does not yet have this method.
        const delimiter = /\?/.test(href) ? '&' : '?';
        href += delimiter + paramString;
      }
    }

    const tooltipId = _.uniqueId();
    let tooltipText = level.isSublevel
      ? level.display_name
      : levelName || (level.isUnplugged && i18n.unpluggedActivity()) || '';
    if (number) {
      tooltipText = `${number}. ${tooltipText}`;
    }

    const tooltip = (
      <TooltipWithIcon
        tooltipId={tooltipId}
        icon={levelIcon}
        text={tooltipText}
        includeAssessmentIcon={levelIsAssessment}
      />
    );

    if (level.isUnplugged && !smallBubble) {
      return (
        <ProgressPill
          levels={[level]}
          text={i18n.unpluggedActivity()}
          tooltip={this.props.hideToolTips ? null : tooltip}
          progressStyle={true}
        />
      );
    }

    // Two pixels on each side for border, 2 pixels on each side for margin.
    const width = (smallBubble ? SMALL_DOT_SIZE : DOT_SIZE) + 8;

    // Outer div here is used to make sure our bubbles all take up equivalent
    // amounts of space, whether they're diamonds or circles
    let bubble = (
      <div
        style={{
          // two pixels on each side for border, 2 pixels on each side for margin
          width: lessonTrophyEnabled ? width - 3 : width,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div data-tip data-for={tooltipId} aria-describedby={tooltipId}>
          <div style={style} className="uitest-bubble">
            <div
              style={{
                fontSize: level.paired || level.bonus ? 14 : 16,
                ...styles.contents,
                ...(level.isConceptLevel && styles.diamondContents)
              }}
            >
              {level.letter && !smallBubble && (
                <span id="test-bubble-letter"> {level.letter} </span>
              )}
              {levelIcon === 'lock' && !smallBubble && (
                <FontAwesome icon="lock" />
              )}
              {pairingIconEnabled && level.paired && (
                <FontAwesome icon="users" />
              )}
              {level.bonus && <FontAwesome icon="flag-checkered" />}
              {!hideNumber && (
                <span>
                  {/*Text will not show up for smallBubble, but its presence
                    causes bubble to be properly aligned vertically
                    */}
                  {smallBubble ? '' : number}
                </span>
              )}
            </div>
            {levelIsAssessment && !smallBubble && !hideAssessmentIcon && (
              <SmallAssessmentIcon isDiamond={level.isConceptLevel} />
            )}
          </div>
          {!this.props.hideToolTips && tooltip}
        </div>
      </div>
    );

    // If we have an href, wrap in an achor tag
    // Only record the click if we are in the progress tab (currently
    // hideAssessmentIcon is only true for progress tab_
    if (href) {
      bubble = (
        <a
          href={href}
          style={{textDecoration: 'none'}}
          className="uitest-ProgressBubble"
          onClick={
            hideAssessmentIcon
              ? this.recordProgressTabProgressBubbleClick
              : null
          }
        >
          {bubble}
        </a>
      );
    } else if (onClick) {
      bubble = (
        <a
          style={{textDecoration: 'none'}}
          className="uitest-ProgressBubble"
          onClick={() => onClick(level)}
        >
          {bubble}
        </a>
      );
    }

    return bubble;
  }
}

/**
 * A ProgressBubble represents progress for a specific level. It can be a circle
 * or a diamond (or a pill in the case of unplugged levels), and it can be big
 * or small. The fill and outline change depending on the level status.
 */

const styles = {
  main: {
    boxSizing: 'content-box',
    fontFamily: '"Gotham 5r", sans-serif',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE,
    borderStyle: 'solid',
    borderColor: color.lighter_gray,
    fontSize: 16,
    letterSpacing: -0.11,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition:
      'background-color .2s ease-out, border-color .2s ease-out, color .2s ease-out',
    marginTop: 3,
    marginBottom: 3,
    position: 'relative'
  },
  largeDiamond: {
    width: DIAMOND_DOT_SIZE,
    height: DIAMOND_DOT_SIZE,
    borderRadius: 4,
    transform: 'rotate(45deg)',
    marginTop: 6,
    marginBottom: 6
  },
  small: {
    width: SMALL_DOT_SIZE,
    height: SMALL_DOT_SIZE,
    borderRadius: SMALL_DOT_SIZE,
    fontSize: 0,
    alignItems: 'none'
  },
  smallDiamond: {
    width: SMALL_DIAMOND_SIZE,
    height: SMALL_DIAMOND_SIZE,
    borderRadius: 2,
    fontSize: 0,
    transform: 'rotate(45deg)',
    marginLeft: 1,
    marginRight: 1
  },
  contents: {
    whiteSpace: 'nowrap',
    lineHeight: '16px'
  },
  diamondContents: {
    // undo the rotation from the parent
    transform: 'rotate(-45deg)'
  },
  disabledStageExtras: {
    backgroundColor: color.lighter_gray,
    color: color.white
  },
  highlighted: {
    color: color.white,
    backgroundColor: color.orange,
    borderColor: color.orange
  }
};

export default Radium(ProgressBubble);
