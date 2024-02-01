import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLevelProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LevelDataCell from './LevelDataCell';
import ExpandedProgressColumnHeader from './ExpandedProgressColumnHeader.jsx';

function ExpandedProgressDataColumn({
  lesson,
  sectionId,
  levelProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
}) {
  const [expandedChoiceLevels, setExpandedChoiceLevels] = React.useState([]);

  const toggleExpandedChoiceLevel = level => {
    if (expandedChoiceLevels.includes(level.id)) {
      setExpandedChoiceLevels(expandedChoiceLevels.filter(l => l !== level.id));
    } else if (level?.sublevels?.length > 0) {
      setExpandedChoiceLevels([...expandedChoiceLevels, level.id]);
    }
  };

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
                sectionId={sectionId}
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
    [levelProgressByStudent, sortedStudents, lesson, sectionId]
  );

  return (
    <div key={lesson.id} className={styles.expandedColumn}>
      <ExpandedProgressColumnHeader
        lesson={lesson}
        removeExpandedLesson={removeExpandedLesson}
        expandedChoiceLevels={expandedChoiceLevels}
        toggleExpandedChoiceLevel={toggleExpandedChoiceLevel}
      />
      {progress}
    </div>
  );
}

ExpandedProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  sectionId: PropTypes.number,
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
