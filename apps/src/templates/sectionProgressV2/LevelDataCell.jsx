import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentLevelProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import legendStyles from './progress-table-legend.module.scss';
import {Link} from '@dsco_/link';
import ProgressIcon from './ProgressIcon';
import {ITEM_TYPE} from './ItemType';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import queryString from 'query-string';
import {feedbackLeft, studentNeedsFeedback} from '../progress/progressHelpers';

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
}) {
  const itemType = React.useMemo(() => {
    if (expandedChoiceLevel) {
      return ITEM_TYPE.CHOICE_LEVEL;
    }
    if (studentLevelProgress?.teacherFeedbackReviewState === 'keepWorking') {
      return ITEM_TYPE.KEEP_WORKING;
    }
    if (
      !studentLevelProgress ||
      studentLevelProgress.status === LevelStatus.not_tried
    ) {
      return;
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
  }, [studentLevelProgress, level, expandedChoiceLevel]);

  const feedbackStyle = React.useMemo(() => {
    if (feedbackLeft(studentLevelProgress)) {
      return legendStyles.feedbackGiven;
    }
    if (studentNeedsFeedback(studentLevelProgress, level)) {
      return legendStyles.needsFeedback;
    }
  }, [studentLevelProgress, level]);

  return (
    <Link
      href={navigateToLevelOverviewUrl(level.url, studentId, sectionId)}
      openInNewTab
      external
      className={classNames(styles.gridBox, styles.gridBoxLevel, feedbackStyle)}
    >
      {itemType && <ProgressIcon itemType={itemType} />}
    </Link>
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
};
