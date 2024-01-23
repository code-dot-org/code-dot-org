import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LessonDataCell from './LessonDataCell';
import LessonProgressColumnHeader from './LessonProgressColumnHeader';

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  sortedStudents,
  addExpandedLesson,
}) {
  return (
    <div className={styles.lessonColumn}>
      <LessonProgressColumnHeader
        lesson={lesson}
        addExpandedLesson={addExpandedLesson}
      />

      <div className={styles.lessonDataColumn}>
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
    </div>
  );
}

LessonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ),
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};

export const UnconnectedLessonProgressDataColumn = LessonProgressDataColumn;

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(LessonProgressDataColumn);
