import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import {lessonHasLevels} from '../progress/progressHelpers';
import FontAwesome from '../FontAwesome';

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div
      className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
      key={lesson.id}
    >
      {lesson.relative_position}
    </div>
  );
};

export default function ProgressTableHeader({
  lessons,
  expandedLessonIds,
  addExpandedLesson,
  removeExpandedLesson,
}) {
  const getExpandedLessonColumnHeader = React.useCallback(
    lesson => {
      console.log(lesson);
      return (
        <div key={lesson.id} className={styles.headerExpanded}>
          <div
            className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
            onClick={() => removeExpandedLesson(lesson.id)}
          >
            <FontAwesome icon="caret-down" />
            {lesson.relative_position}
          </div>
          <div className={styles.headerExpandedSecondRow}>
            {lesson.levels.map(level => (
              <div
                className={classNames(
                  styles.gridBox,
                  styles.gridBoxLevelHeader
                )}
              >
                {lesson.relative_position + '.' + level.bubbleText}
              </div>
            ))}
          </div>
        </div>
      );
    },
    [removeExpandedLesson]
  );

  const getLessonColumnHeader = React.useCallback(
    lesson => {
      if (!lessonHasLevels(lesson)) {
        return getUninteractiveLessonColumnHeader(lesson);
      }
      if (expandedLessonIds.includes(lesson.id)) {
        return getExpandedLessonColumnHeader(lesson);
      }
      return (
        <div
          className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
          onClick={() => addExpandedLesson(lesson.id)}
          key={lesson.id}
        >
          <FontAwesome icon="caret-right" />
          {lesson.relative_position}
        </div>
      );
    },
    [expandedLessonIds, addExpandedLesson, getExpandedLessonColumnHeader]
  );

  return (
    <div className={styles.header}>
      <div className={styles.headerColumns}>
        {lessons.map(lesson => getLessonColumnHeader(lesson))}
      </div>
    </div>
  );
}

ProgressTableHeader.propTypes = {
  lessons: PropTypes.array.isRequired,
  expandedLessonIds: PropTypes.array.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};
