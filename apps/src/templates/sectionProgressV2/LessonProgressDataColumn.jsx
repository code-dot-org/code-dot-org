import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  studentLessonProgressType,
  studentLevelProgressType,
} from '../progress/progressTypes';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';

import FloatingHeader from './floatingHeader/FloatingHeader';
import LessonDataCell from './LessonDataCell';
import LessonProgressColumnHeader from './LessonProgressColumnHeader';

import styles from './progress-table-v2.module.scss';

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  levelProgressByStudent,
  sortedStudents,
  addExpandedLesson,
  expandedMetadataStudentIds,
  tableRef,
}) {
  const columnRef = React.useRef();

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

  const header = (
    <LessonProgressColumnHeader
      lesson={lesson}
      addExpandedLesson={addExpandedLesson}
      allLocked={allLocked}
    />
  );

  return (
    <div className={styles.lessonColumn}>
      <FloatingHeader header={header} id={lesson.id} tableRef={tableRef}>
        <div className={styles.lessonDataColumn} ref={columnRef}>
          {sortedStudents.map(student => (
            <LessonDataCell
              locked={lockedPerStudent[student.id]}
              lesson={lesson}
              studentLessonProgress={
                lessonProgressByStudent[student.id][lesson.id]
              }
              key={student.id + '.' + lesson.id}
              studentId={student.id}
              addExpandedLesson={addExpandedLesson}
              metadataExpanded={expandedMetadataStudentIds.includes(student.id)}
            />
          ))}
        </div>
      </FloatingHeader>
    </div>
  );
}

export const UnconnectedLessonProgressDataColumn = LessonProgressDataColumn;

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
  expandedMetadataStudentIds: PropTypes.array,
  tableRef: PropTypes.object,
};

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
  expandedMetadataStudentIds: state.sectionProgress.expandedMetadataStudentIds,
}))(LessonProgressDataColumn);
