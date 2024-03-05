import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentLessonProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import {lessonHasLevels} from '../progress/progressHelpers';
import {ITEM_TYPE} from './ItemType';
import ProgressIcon from './ProgressIcon';
import {Link} from '@dsco_/link';
import {navigateToLevelOverviewUrl} from './levelUrlUtils';

function LessonDataCell({
  lesson,
  sectionId,
  locked,
  studentLessonProgress,
  addExpandedLesson,
  studentId,
}) {
  const noLevels = !lessonHasLevels(lesson);
  const finished = studentLessonProgress?.completedPercent === 100;
  const partiallyComplete = studentLessonProgress && !finished;

  const linkToFirstLesson = lesson.lockable && lesson.assessment;

  const interactive = !noLevels || (lesson.lockable && !linkToFirstLesson);

  const getCellComponent = children => {
    if (linkToFirstLesson && interactive) {
      return (
        <Link
          className={classNames(
            styles.gridBox,
            styles.gridBoxLesson,
            locked && styles.littleLock
          )}
          href={navigateToLevelOverviewUrl(
            lesson.levels[0].url,
            studentId,
            sectionId
          )}
          openInNewTab
          external
          data-testid={'lesson-data-cell-' + lesson.id + '-' + studentId}
        >
          {children}
        </Link>
      );
    }

    return (
      <div
        className={classNames(
          styles.gridBox,
          styles.gridBoxLesson,
          locked && styles.littleLock,
          interactive && styles.lessonInteractive
        )}
        onClick={expandLesson}
        data-testid={'lesson-data-cell-' + lesson.id + '-' + studentId}
      >
        {children}
      </div>
    );
  };

  const expandLesson = interactive
    ? () => addExpandedLesson(lesson.id)
    : undefined;

  return getCellComponent(
    <>
      {finished && <ProgressIcon itemType={ITEM_TYPE.SUBMITTED} />}
      {partiallyComplete && <ProgressIcon itemType={ITEM_TYPE.IN_PROGRESS} />}
      {noLevels && <ProgressIcon itemType={ITEM_TYPE.NO_ONLINE_WORK} />}
    </>
  );
}

export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
}))(LessonDataCell);

LessonDataCell.propTypes = {
  locked: PropTypes.bool,
  sectionId: PropTypes.number,
  studentLessonProgress: studentLessonProgressType,
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  studentId: PropTypes.number.isRequired,
};
