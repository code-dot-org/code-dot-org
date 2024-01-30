import PropTypes from 'prop-types';
import React from 'react';
import {studentLessonProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import {lessonHasLevels} from '../progress/progressHelpers';
import {ICON_TYPE} from './IconType';
import ProgressIcon from './ProgressIcon';

export default function LessonDataCell({lesson, studentLessonProgress}) {
  const noLevels = !lessonHasLevels(lesson);
  const finished = studentLessonProgress?.completedPercent === 100;
  const partiallyComplete = studentLessonProgress && !finished;

  return (
    <div className={classNames(styles.gridBox, styles.gridBoxLesson)}>
      {finished && <ProgressIcon itemType={ICON_TYPE.SUBMITTED} />}
      {partiallyComplete && <ProgressIcon itemType={ICON_TYPE.IN_PROGRESS} />}
      {noLevels && <ProgressIcon itemType={ICON_TYPE.NO_ONLINE_WORK} />}
    </div>
  );
}

LessonDataCell.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentLessonProgress: studentLessonProgressType,
  lesson: PropTypes.object.isRequired,
};
