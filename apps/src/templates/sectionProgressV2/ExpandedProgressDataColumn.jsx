import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLevelProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import LevelDataCell from './LevelDataCell';
import i18n from '@cdo/locale';

// see styles.expandedHeaderLevelCell{min-width} + 1px border
const LEVEL_HEADER_WIDTH = 53;

function ExpandedProgressDataColumn({
  lesson,
  levelProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
}) {
  const header = React.useMemo(() => {
    // If there are only 2 levels, we only show the number so that the text fits the cell.
    const headerText =
      lesson.levels.length < 3
        ? lesson.relative_position
        : i18n.lesson() + ' ' + lesson.relative_position + ': ' + lesson.name;

    // Manual width is necessary so that overflow text is hidden and lesson header exactly fits levels.
    // Add one for border. Each level cell has a 1px border on the right and there i.
    const width = lesson.levels.length * LEVEL_HEADER_WIDTH + 1 + 'px';
    return (
      <div className={styles.expandedHeader}>
        <div
          className={classNames(
            styles.gridBox,
            styles.expandedHeaderLessonCell
          )}
          style={{width}}
          onClick={() => removeExpandedLesson(lesson.id)}
          aria-label={headerText}
        >
          <FontAwesome
            icon="caret-down"
            className={styles.expandedHeaderCaret}
          />
          <div className={styles.expandedHeaderLessonText}>{headerText}</div>
        </div>
        <div className={styles.expandedHeaderSecondRow}>
          {lesson.levels.map(level => (
            <div
              className={classNames(
                styles.gridBox,
                styles.expandedHeaderLevelCell
              )}
              key={lesson.id + '.' + level.bubbleText + '-h'}
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
          <div
            className={styles.expandedLevelColumn}
            key={lesson.bubbleText + '.' + level.id}
          >
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
