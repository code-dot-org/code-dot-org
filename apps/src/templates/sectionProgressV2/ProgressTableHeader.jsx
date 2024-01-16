import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import {lessonHasLevels} from '../progress/progressHelpers';
import FontAwesome from '../FontAwesome';

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div
      className={classNames(styles.gridBox, styles.headerLesson)}
      key={lesson.id}
    >
      {lesson.relative_position}
    </div>
  );
};

export default function ProgressTableHeader({
  lessons,
  groupedLessonIds,
  addExpandedLesson,
  removeExpandedLesson,
}) {
  const getExpandedLessonColumnHeader = React.useCallback(
    lesson => {
      return (
        <div key={lesson.id} className={styles.headerExpanded}>
          <div
            className={classNames(styles.gridBox, styles.headerLesson)}
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

  const getUnexpectedLessonColumnHeader = React.useCallback(
    lesson => {
      if (!lessonHasLevels(lesson)) {
        return getUninteractiveLessonColumnHeader(lesson);
      }
      return (
        <div
          className={classNames(styles.gridBox, styles.headerLesson)}
          onClick={() => addExpandedLesson(lesson.id)}
          key={lesson.id}
        >
          <FontAwesome icon="caret-right" />
          {lesson.relative_position}
        </div>
      );
    },
    [addExpandedLesson]
  );

  const getLessonColumnHeader = React.useCallback(
    grouplessonsId => {
      if (grouplessonsId.expanded) {
        const lesson = lessons.find(l => l.id === grouplessonsId.ids[0]);
        return (
          <div className={styles.headerGroup}>
            {getExpandedLessonColumnHeader(lesson)}
          </div>
        );
      }
      const groupedLessons = grouplessonsId.ids.map(lessonId =>
        lessons.find(l => l.id === lessonId)
      );

      return (
        <div className={styles.headerGroup}>
          {groupedLessons.map(lesson =>
            getUnexpectedLessonColumnHeader(lesson)
          )}
        </div>
      );
    },
    [lessons, getUnexpectedLessonColumnHeader, getExpandedLessonColumnHeader]
  );

  return (
    <div className={styles.header}>
      {groupedLessonIds.map(grouplessonsId =>
        getLessonColumnHeader(grouplessonsId)
      )}
    </div>
  );
}

ProgressTableHeader.propTypes = {
  lessons: PropTypes.array.isRequired,
  groupedLessonIds: PropTypes.arrayOf(PropTypes.object).isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};
