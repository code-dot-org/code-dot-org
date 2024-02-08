import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';
import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div className={styles.lessonHeaderCellContainer}>
      <div
        className={classNames(styles.gridBox, styles.lessonHeaderCell)}
        key={lesson.id}
        data-tip
        data-for={getTooltipId(lesson)}
      >
        <LessonTitleTooltip lesson={lesson} />
        {lesson.relative_position}
      </div>
    </div>
  );
};

const getSkeletonLessonHeader = lessonId => (
  <div
    className={classNames(
      styles.gridBox,
      styles.lessonHeaderCell,
      styles.lessonHeaderCellContainer
    )}
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
    <div className={styles.lessonHeaderCellContainer}>
      <div
        className={classNames(
          styles.gridBox,
          styles.lessonHeaderCell,
          styles.pointerMouse
        )}
        data-tip
        data-for={getTooltipId(lesson)}
        onClick={() => addExpandedLesson(lesson.id)}
      >
        <LessonTitleTooltip lesson={lesson} />
        <FontAwesome icon="caret-right" className={styles.lessonHeaderCaret} />
        {lesson.relative_position}
      </div>
    </div>
  );
}

LessonProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};
