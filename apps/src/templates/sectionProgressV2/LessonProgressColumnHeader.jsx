import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import i18n from '@cdo/locale';

import FontAwesome from '../FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';

import LessonTitleTooltip, {getTooltipId} from './LessonTitleTooltip';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

const getUninteractiveLessonColumnHeader = (lesson, allLocked) => {
  return (
    <div
      className={classNames(styles.gridBox, styles.lessonHeaderCell)}
      key={lesson.id}
      data-tip
      data-for={getTooltipId(lesson)}
    >
      <LessonTitleTooltip lesson={lesson} />
      {!lesson.lockable && lesson.relative_position}
      {lesson.lockable && (
        <FontAwesome icon={allLocked ? 'lock' : 'lock-open'} />
      )}
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
  allLocked,
}) {
  if (lesson.isFake) {
    return getSkeletonLessonHeader(lesson.id);
  }
  if (!lessonHasLevels(lesson) || lesson.lockable) {
    return getUninteractiveLessonColumnHeader(lesson, allLocked);
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
        onClick={() => addExpandedLesson(lesson)}
      >
        <LessonTitleTooltip lesson={lesson} />
        <FontAwesome
          icon="caret-right"
          className={styles.lessonHeaderCaret}
          title={i18n.expand()}
        />
        {lesson.relative_position}
      </div>
    </div>
  );
}

LessonProgressColumnHeader.propTypes = {
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
  allLocked: PropTypes.bool,
};
