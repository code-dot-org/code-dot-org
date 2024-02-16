import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {
  studentLessonProgressType,
  studentLevelProgressType,
} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LessonDataCell from './LessonDataCell';
import LessonProgressColumnHeader from './LessonProgressColumnHeader';

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  levelProgressByStudent,
  sortedStudents,
  addExpandedLesson,
}) {
  const lockedPerStudent = React.useMemo(
    () =>
      Object.fromEntries(
        sortedStudents.map(student => [
          student.id,
          lesson.lockable &&
            lesson.levels.every(
              level => levelProgressByStudent[student.id][level.id]?.locked
            ),
        ])
      ),
    [levelProgressByStudent, sortedStudents, lesson]
  );

  // For lockable lessons, check whether each level is locked for each student.
  // Used to control locked/unlocked icon in lesson header.
  const allLocked = React.useMemo(
    () => sortedStudents.every(student => lockedPerStudent[student.id]),
    [sortedStudents, lockedPerStudent]
  );

  return (
    <div className={styles.lessonColumn}>
      <LessonProgressColumnHeader
        lesson={lesson}
        addExpandedLesson={addExpandedLesson}
        allLocked={allLocked}
      />

      <div className={styles.lessonDataColumn}>
        {sortedStudents.map(student => (
          <LessonDataCell
            locked={lockedPerStudent[student.id]}
            lesson={lesson}
            studentLessonProgress={
              lessonProgressByStudent[student.id][lesson.id]
            }
            key={student.id + '.' + lesson.id}
            addExpandedLesson={addExpandedLesson}
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
  ).isRequired,
  levelProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLevelProgressType)
  ).isRequired,
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};

export const UnconnectedLessonProgressDataColumn = LessonProgressDataColumn;

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(LessonProgressDataColumn);
