import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LessonDataCell from './LessonDataCell';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div
      className={classNames(styles.gridBox, styles.lessonHeaderCell)}
      key={lesson.id}
    >
      {lesson.relative_position}
    </div>
  );
};

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  sortedStudents,
  addExpandedLesson,
}) {
  const getHeader = React.useCallback(
    lesson => {
      if (!lessonHasLevels(lesson)) {
        return getUninteractiveLessonColumnHeader(lesson);
      }
      return (
        <div
          className={classNames(styles.gridBox, styles.lessonHeaderCell)}
          onClick={() => addExpandedLesson(lesson.id)}
        >
          <FontAwesome icon="caret-right" />
          {lesson.relative_position}
        </div>
      );
    },
    [addExpandedLesson]
  );

  const getProgress = React.useCallback(
    lesson => (
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
    ),
    [lessonProgressByStudent, sortedStudents]
  );

  return (
    <div className={styles.lessonColumn}>
      {getHeader(lesson)}
      {getProgress(lesson)}
    </div>
  );
}

LessonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
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
}))(LessonProgressDataColumn);
