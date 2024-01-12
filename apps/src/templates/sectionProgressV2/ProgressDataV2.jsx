import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import styles from './progress-table-v2.module.scss';
import LessonDataCell from './LessonDataCell';

function ProgressDataV2({sortedStudents, lessons, lessonProgressByStudent}) {
  const getLessonColumn = React.useCallback(
    lesson => (
      <div className={styles.dataColumn} key={lesson.id}>
        {sortedStudents.map(student => (
          <LessonDataCell
            studentId={student.id}
            lesson={lesson}
            studentLessonProgress={
              lessonProgressByStudent[student.id][lesson.id]
            }
            key={student.id + '.' + lesson.id}
          />
        ))}
      </div>
    ),
    [lessonProgressByStudent, sortedStudents]
  );

  return (
    <div className={styles.dataTable}>
      {lessons.map(lesson => getLessonColumn(lesson))}
    </div>
  );
}

ProgressDataV2.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ).isRequired,
  lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export const UnconnectedProgressDataV2 = ProgressDataV2;

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ProgressDataV2);
