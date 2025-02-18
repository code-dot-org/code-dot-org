import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import fontConstants from '@cdo/apps/fontConstants';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

import FocusAreaIndicator from './FocusAreaIndicator';
import ProgressBubbleSet from './ProgressBubbleSet';
import {
  lessonIsLockedForAllStudents,
  lessonIsLockedForUser,
  lessonIsVisible,
} from './progressHelpers';
import {levelWithProgressType, lessonType} from './progressTypes';

function SummaryProgressRow({
  dark,
  lesson,
  levels,
  lessonIsHiddenForStudents,
  lessonIsLockedForUser,
  lessonIsLockedForAllStudents,
  viewAs,
}) {
  // The parent component filters out hidden SummaryProgressRows from the student view,
  // this check is just to ensure it won't be rendered if it should be hidden for students
  if (lessonIsHiddenForStudents && viewAs === ViewType.Participant) {
    return null;
  }

  const isLockedForUser = lessonIsLockedForUser(lesson, levels, viewAs);
  const isLockedForSection = lessonIsLockedForAllStudents(lesson.id);
  const showAsLocked = isLockedForUser || isLockedForSection;

  let lessonTitle = lesson.name;
  if (lesson.lessonNumber) {
    lessonTitle = lesson.lessonNumber + '. ' + lessonTitle;
  }

  const displayDashedBorder = lessonIsHiddenForStudents || showAsLocked;

  const titleTooltipId = _.uniqueId();
  const lockedTooltipId = _.uniqueId();

  return (
    <tr
      id={`summary-progress-row-${lesson.lessonNumber}`}
      className="uitest-summary-progress-row"
      style={{
        ...(dark ? styles.darkRow : styles.lightRow),
        ...(displayDashedBorder && styles.dashedBorder),
      }}
    >
      <td
        style={{
          ...styles.col1,
          ...(isLockedForUser && styles.fadedCol),
        }}
      >
        <div style={styles.colText}>
          {lessonIsHiddenForStudents && (
            <FontAwesome icon="eye-slash" style={styles.icon} />
          )}
          {lesson.lockable && (
            <span data-tip data-for={lockedTooltipId}>
              <FontAwesome
                icon={showAsLocked ? 'lock' : 'unlock'}
                style={{
                  ...styles.icon,
                  ...(!showAsLocked && styles.unlockedIcon),
                }}
              />
              {!showAsLocked && viewAs === ViewType.Instructor && (
                <ReactTooltip
                  id={lockedTooltipId}
                  role="tooltip"
                  wrapper="span"
                  effect="solid"
                >
                  {i18n.lockAssessmentLong()}
                </ReactTooltip>
              )}
            </span>
          )}
          <span
            data-tip
            data-for={titleTooltipId}
            aria-describedby={titleTooltipId}
          >
            {lessonTitle}
            <ReactTooltip
              id={titleTooltipId}
              role="tooltip"
              wrapper="span"
              effect="solid"
            >
              {lesson.name}
            </ReactTooltip>
          </span>
        </div>
      </td>
      <td
        style={{
          ...styles.col2,
          ...(isLockedForUser && styles.fadedCol),
        }}
      >
        {levels.length === 0 ? (
          i18n.lessonContainsNoLevels()
        ) : (
          <ProgressBubbleSet
            levels={levels}
            disabled={isLockedForUser}
            style={lesson.isFocusArea ? styles.focusAreaMargin : undefined}
            lessonName={lesson.name}
          />
        )}
        {lesson.isFocusArea && <FocusAreaIndicator />}
      </td>
    </tr>
  );
}

SummaryProgressRow.propTypes = {
  dark: PropTypes.bool.isRequired,
  lesson: lessonType.isRequired,
  levels: PropTypes.arrayOf(levelWithProgressType).isRequired,

  // from redux
  viewAs: PropTypes.oneOf(Object.keys(ViewType)),
  lessonIsHiddenForStudents: PropTypes.bool.isRequired,
  lessonIsLockedForUser: PropTypes.func.isRequired,
  lessonIsLockedForAllStudents: PropTypes.func.isRequired,
};

export const styles = {
  lightRow: {
    backgroundColor: color.table_light_row,
  },
  darkRow: {
    backgroundColor: color.table_dark_row,
  },
  dashedBorder: {
    borderStyle: 'dashed',
    borderWidth: 2,
  },
  col1: {
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    lineHeight: '52px',
    color: color.charcoal,
    letterSpacing: -0.11,
    whiteSpace: 'nowrap',
    paddingLeft: 20,
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: color.border_light_gray,
    borderRightStyle: 'solid',
  },
  col2: {
    position: 'relative',
    width: '100%',
    paddingLeft: 20,
    paddingRight: 20,
  },
  // When we set our opacity on the row element instead of on individual tds,
  // there are weird interactions with our tooltips in Chrome, and borders end
  // up disappearing.
  fadedCol: {
    opacity: 0.6,
  },
  colText: {
    color: color.charcoal,
    ...fontConstants['main-font-semi-bold'],
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  icon: {
    marginRight: 5,
    fontSize: 12,
    color: color.cyan,
  },
  unlockedIcon: {
    color: color.orange,
  },
  focusAreaMargin: {
    // Our focus area indicator is absolutely positioned. Add a margin when it's
    // there so that it wont overlap dots.
    marginRight: 130,
  },
  opaque: {
    opacity: 1,
  },
};

export const UnconnectedSummaryProgressRow = SummaryProgressRow;
export default connect((state, ownProps) => ({
  viewAs: state.viewAs,
  lessonIsHiddenForStudents: !lessonIsVisible(
    ownProps.lesson,
    state,
    ViewType.Participant
  ),
  lessonIsLockedForUser: (lesson, levels, viewAs) =>
    lessonIsLockedForUser(lesson, levels, state, viewAs),
  lessonIsLockedForAllStudents: lessonId =>
    lessonIsLockedForAllStudents(lessonId, state),
}))(SummaryProgressRow);
