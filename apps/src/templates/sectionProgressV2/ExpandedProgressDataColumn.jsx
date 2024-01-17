import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LessonDataCell from './LessonDataCell';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';

function ExpandedProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
}) {
  const header = React.useMemo(() => {
    return (
      <div className={styles.headerExpanded}>
        <div
          className={classNames(styles.gridBox, styles.headerExpandedLesson)}
          onClick={() => removeExpandedLesson(lesson.id)}
        >
          <FontAwesome icon="caret-down" />
          {lesson.relative_position}
        </div>
        <div className={styles.headerExpandedSecondRow}>
          {lesson.levels.map(level => (
            <div
              className={classNames(styles.gridBox, styles.gridBoxLevelHeader)}
              key={lesson.id + '.' + level.bubbleText}
            >
              {lesson.relative_position + '.' + level.bubbleText}
            </div>
          ))}
        </div>
      </div>
    );
  }, [removeExpandedLesson, lesson]);

  const progress = React.useMemo(
    () => (
      <div className={styles.dataColumn}>
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
    [lessonProgressByStudent, sortedStudents, lesson]
  );

  return (
    <div key={lesson.id} className={styles.expandedColumn}>
      {header}
      {progress}
    </div>
  );
}

ExpandedProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ).isRequired,
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ExpandedProgressDataColumn);
