import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {
  studentLessonProgressType,
  studentLevelProgressType,
} from '../progress/progressTypes';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';

import LessonDataCell from './LessonDataCell';
import LessonProgressColumnHeader from './LessonProgressColumnHeader';
import {
  getLockedStatusPerStudent,
  areAllLevelsLocked,
} from './LockedLessonUtils';

import styles from './progress-table-v2.module.scss';

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  levelProgressByStudent,
  sortedStudents,
  expandedMetadataStudentIds,
}) {
  const lockedPerStudent = React.useMemo(
    () =>
      getLockedStatusPerStudent(levelProgressByStudent, sortedStudents, lesson),
    [levelProgressByStudent, sortedStudents, lesson]
  );

  // For lockable lessons, check whether each level is locked for each student.
  // Used to control locked/unlocked icon in lesson header.
  const allLocked = React.useMemo(
    () => areAllLevelsLocked(lockedPerStudent),
    [lockedPerStudent]
  );

  return (
    <div className={styles.lessonColumn}>
      <LessonProgressColumnHeader lesson={lesson} allLocked={allLocked} />

      <div className={styles.lessonDataColumn}>
        {sortedStudents.map(student => (
          <LessonDataCell
            locked={lockedPerStudent[student.id]}
            lesson={lesson}
            studentLessonProgress={
              lessonProgressByStudent[student.id][lesson.id]
            }
            key={student.id + '.' + lesson.id}
            studentId={student.id}
            metadataExpanded={expandedMetadataStudentIds.includes(student.id)}
          />
        ))}
      </div>
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
  expandedMetadataStudentIds: PropTypes.array,
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
