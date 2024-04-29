import {Link} from '@dsco_/link';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {commentLeft, studentNeedsFeedback} from '../progress/progressHelpers';
import {studentLevelProgressType} from '../progress/progressTypes';

import {ITEM_TYPE} from './ItemType';
import ProgressIcon from './ProgressIcon';

import legendStyles from './progress-table-legend.module.scss';
import styles from './progress-table-v2.module.scss';

const levelClickedAmplitude = (sectionId, isAssessment) => () => {
  analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_VIEW_LEVEL_DETAILS, {
    sectionId: sectionId,
    isAssessment: isAssessment,
  });
};

export const getStudentRowHeaderId = studentId => `s-${studentId}`;
export const getLessonColumnHeaderId = lessonId => `l-${lessonId}`;
export const getLevelColumnHeaderId = (levelId, parentLevelId) =>
  parentLevelId !== undefined
    ? `lvl-${parentLevelId}.${levelId}`
    : `lvl-${levelId}`;

const getHeadersForCell = (studentId, levelId, parentLevelId, lessonId) => {
  return (
    getStudentRowHeaderId(studentId) +
    ' ' +
    getLevelColumnHeaderId(levelId) +
    ' ' +
    (parentLevelId !== undefined
      ? getLevelColumnHeaderId(levelId, parentLevelId) + ' '
      : '') +
    getLessonColumnHeaderId(lessonId)
  );
};

export const navigateToLevelOverviewUrl = (levelUrl, studentId, sectionId) => {
  if (!levelUrl) {
    return null;
  }
  const params = {};

  if (sectionId) {
    params.section_id = sectionId;
  }
  if (studentId) {
    params.user_id = studentId;
  }
  if (Object.keys(params).length) {
    return `${levelUrl}?${queryString.stringify(params)}`;
  }
  return levelUrl;
};

function LevelDataCell({
  level,
  studentId,
  sectionId,
  studentLevelProgress,
  expandedChoiceLevel,
  className,
  linkClassName,
  parentLevelId,
  lessonId,
}) {
  const itemType = React.useMemo(() => {
    if (expandedChoiceLevel) {
      return ITEM_TYPE.CHOICE_LEVEL;
    }
    if (
      studentLevelProgress?.teacherFeedbackReviewState === 'keepWorking' &&
      studentLevelProgress?.teacherFeedbackNew
    ) {
      return ITEM_TYPE.KEEP_WORKING;
    }
    if (
      !studentLevelProgress ||
      studentLevelProgress.status === LevelStatus.not_tried
    ) {
      return ITEM_TYPE.NO_PROGRESS;
    }
    if (
      studentLevelProgress.status === LevelStatus.perfect ||
      studentLevelProgress.status === LevelStatus.submitted ||
      studentLevelProgress.status === LevelStatus.free_play_complete ||
      studentLevelProgress.status === LevelStatus.completed_assessment
    ) {
      if (level.isValidated) {
        return ITEM_TYPE.VALIDATED;
      } else {
        return ITEM_TYPE.SUBMITTED;
      }
    }
    if (
      studentLevelProgress.status === LevelStatus.attempted ||
      studentLevelProgress.status === LevelStatus.passed
    ) {
      return ITEM_TYPE.IN_PROGRESS;
    }
    return ITEM_TYPE.NO_PROGRESS;
  }, [studentLevelProgress, level, expandedChoiceLevel]);

  const feedbackStyle = React.useMemo(() => {
    if (expandedChoiceLevel) {
      return;
    }
    if (commentLeft(studentLevelProgress)) {
      return legendStyles.feedbackGiven;
    }
    if (studentNeedsFeedback(studentLevelProgress, level)) {
      return legendStyles.needsFeedback;
    }
  }, [studentLevelProgress, level, expandedChoiceLevel]);

  return (
    <td
      className={classNames(
        styles.gridBox,
        styles.gridBoxLevel,
        feedbackStyle,
        className
      )}
      headers={getHeadersForCell(studentId, level.id, parentLevelId, lessonId)}
    >
      <Link
        id={'ui-test' + level.path?.replaceAll('/', '-') + '-cell-data'}
        href={navigateToLevelOverviewUrl(level.url, studentId, sectionId)}
        openInNewTab
        external
        onClick={levelClickedAmplitude(sectionId, level.kind === 'assessment')}
        className={classNames(styles.expandedLevelLink, linkClassName)}
      >
        {itemType ? (
          <ProgressIcon itemType={itemType} />
        ) : (
          <div className={styles.expandedLevelEmpty} />
        )}
      </Link>
    </td>
  );
}

export const UnconnectedLevelDataCell = LevelDataCell;

export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
}))(LevelDataCell);

LevelDataCell.propTypes = {
  studentId: PropTypes.number,
  sectionId: PropTypes.number,
  studentLevelProgress: studentLevelProgressType,
  level: PropTypes.object.isRequired,
  expandedChoiceLevel: PropTypes.bool,
  parentLevelId: PropTypes.string,
  lessonId: PropTypes.number.isRequired,
  className: PropTypes.string,
  linkClassName: PropTypes.string,
};
