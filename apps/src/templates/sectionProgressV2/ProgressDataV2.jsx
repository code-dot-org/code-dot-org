import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import {lessonHasLevels} from '../progress/progressHelpers';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';

function ProgressDataV2({sortedStudents, lessons, lessonProgressByStudent}) {
  const lessonDataCell = React.useCallback(
    (studentId, lesson) => {
      if (!lessonHasLevels(lesson)) {
        return (
          <div
            className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
          >
            nolev
          </div>
        );
      }

      const studentLessonProgress =
        lessonProgressByStudent[studentId][lesson.id];
      if (!studentLessonProgress) {
        return (
          <div
            className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
          />
        );
      }
      return (
        <div
          key={studentId + '.' + lesson.id}
          className={classNames(styles.gridBox, styles.gridBoxLessonHeader)}
        >
          {Math.round(studentLessonProgress.completedPercent)}%
        </div>
      );
    },
    [lessonProgressByStudent]
  );

  return (
    <div className={styles.dataTable}>
      {lessons.map(lesson => (
        <div className={styles.dataColumn} key={lesson.id}>
          {sortedStudents.map(student => lessonDataCell(student.id, lesson))}
        </div>
      ))}
    </div>
  );
}

ProgressDataV2.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ).isRequired,
  lessons: PropTypes.array.isRequired,
};

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ProgressDataV2);
