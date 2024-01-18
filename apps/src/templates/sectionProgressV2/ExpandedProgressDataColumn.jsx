import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLevelProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import LevelDataCell from './LevelDataCell';

function ExpandedProgressDataColumn({
  lesson,
  levelProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
}) {
  const header = React.useMemo(() => {
    return (
      <div className={styles.expandedHeader}>
        <div
          className={classNames(
            styles.gridBox,
            styles.expandedHeaderLessonCell
          )}
          onClick={() => removeExpandedLesson(lesson.id)}
        >
          <FontAwesome icon="caret-down" />
          {lesson.relative_position}
        </div>
        <div className={styles.expandedHeaderSecondRow}>
          {lesson.levels.map(level => (
            <div
              className={classNames(
                styles.gridBox,
                styles.expandedHeaderLevelCell
              )}
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
      <div className={styles.expandedTable}>
        {lesson.levels.map(level => (
          <div className={styles.expandedLevelColumn}>
            {sortedStudents.map(student => (
              <LevelDataCell
                studentId={student.id}
                level={level}
                studentLevelProgress={
                  levelProgressByStudent[student.id][level.id]
                }
                key={student.id + '.' + lesson.id + '.' + level.id}
              />
            ))}
          </div>
        ))}
      </div>
    ),
    [levelProgressByStudent, sortedStudents, lesson]
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
  levelProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLevelProgressType)
  ).isRequired,
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
};

export const UnconnectedExpandedProgressDataColumn = ExpandedProgressDataColumn;

export default connect(state => ({
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ExpandedProgressDataColumn);
