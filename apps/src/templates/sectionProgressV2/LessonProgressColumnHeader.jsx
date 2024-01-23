import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div
      className={classNames(styles.gridBox, styles.lessonHeaderCell)}
      key={lesson.id}
    >
      {lesson.relative_position}
    </div>
  );
};

const getSkeletonLessonHeader = lessonId => (
  <div
    className={classNames(styles.gridBox, styles.lessonHeaderCell)}
    key={lessonId}
  >
    <div
      className={classNames(
        styles.lessonSkeletonHeaderCell,
        skeletonizeContent.skeletonizeContent
      )}
    />
  </div>
);

export default function LessonProgressColumnHeader({
  addExpandedLesson,
  lesson,
}) {
  if (lesson.isFake) {
    return getSkeletonLessonHeader(lesson.id);
  }
  if (!lessonHasLevels(lesson)) {
    return getUninteractiveLessonColumnHeader(lesson);
  }
  return (
    <div
      className={classNames(styles.gridBox, styles.lessonHeaderCell)}
      onClick={() => addExpandedLesson(lesson.id)}
    >
      <FontAwesome icon="caret-right" className={styles.lessonHeaderCaret} />
      {lesson.relative_position}
    </div>
  );
}

LessonProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};
