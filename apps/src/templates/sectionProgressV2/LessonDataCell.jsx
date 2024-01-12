import PropTypes from 'prop-types';
import React from 'react';
import {studentLessonProgressType} from '../progress/progressTypes';
import classNames from 'classnames';
import styles from './progress-table-v2.module.scss';
import {lessonHasLevels} from '../progress/progressHelpers';

export default function LessonDataCell({lesson, studentLessonProgress}) {
  const lessonData = React.useMemo(() => {
    if (!lessonHasLevels(lesson)) {
      return 'nolev';
    }
    if (!studentLessonProgress) {
      return;
    }
    return Math.round(studentLessonProgress.completedPercent) + '%';
  }, [lesson, studentLessonProgress]);

  return (
    <div className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}>
      {lessonData}
    </div>
  );
}

LessonDataCell.propTypes = {
  studentId: PropTypes.number.isRequired,
  studentLessonProgress: studentLessonProgressType,
  lesson: PropTypes.object.isRequired,
};
