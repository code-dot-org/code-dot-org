import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';

import {studentLevelProgressType} from '../progress/progressTypes';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';

import ExpandedProgressColumnHeader from './ExpandedProgressColumnHeader.jsx';
import LevelDataCell from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

function ExpandedProgressDataColumn({
  lesson,
  levelProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
  sectionId,
}) {
  const [expandedChoiceLevels, setExpandedChoiceLevels] = React.useState([]);

  const toggleExpandedChoiceLevel = level => {
    if (expandedChoiceLevels.includes(level.id)) {
      setExpandedChoiceLevels(expandedChoiceLevels.filter(l => l !== level.id));
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_COLLAPSE_CHOICE_LEVEL, {
        sectionId: sectionId,
        levelId: level.id,
      });
    } else if (level?.sublevels?.length > 0) {
      setExpandedChoiceLevels([...expandedChoiceLevels, level.id]);
      analyticsReporter.sendEvent(EVENTS.PROGRESS_V2_EXPAND_CHOICE_LEVEL, {
        sectionId: sectionId,
        levelId: level.id,
      });
    }
  };

  const getSingleLevelColumn = React.useCallback(
    (level, propOverrides = {}) => {
      return (
        <div
          className={styles.expandedLevelColumn}
          key={lesson.id + '.' + level.id}
        >
          {sortedStudents.map(student => (
            <LevelDataCell
              studentId={student.id}
              level={level}
              studentLevelProgress={
                levelProgressByStudent[student.id][level.id]
              }
              key={student.id + '.' + lesson.id + '.' + level.id}
              {...propOverrides}
            />
          ))}
        </div>
      );
    },
    [levelProgressByStudent, sortedStudents, lesson]
  );

  const getExpandedChoiceLevel = React.useCallback(
    level => [
      getSingleLevelColumn(level, {expandedChoiceLevel: true}),
      ...level.sublevels.map(sublevel => getSingleLevelColumn(sublevel)),
    ],
    [getSingleLevelColumn]
  );

  const progress = React.useMemo(
    () => (
      <div className={styles.expandedTable}>
        {lesson.levels.flatMap(level => {
          if (
            level.sublevels?.length > 0 &&
            expandedChoiceLevels.includes(level.id)
          ) {
            return getExpandedChoiceLevel(level);
          }
          return [getSingleLevelColumn(level)];
        })}
      </div>
    ),
    [lesson, expandedChoiceLevels, getSingleLevelColumn, getExpandedChoiceLevel]
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
  levelProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLevelProgressType)
  ).isRequired,
  lesson: PropTypes.object.isRequired,
  removeExpandedLesson: PropTypes.func.isRequired,
  sectionId: PropTypes.number,
};

export const UnconnectedExpandedProgressDataColumn = ExpandedProgressDataColumn;

export default connect(state => ({
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ExpandedProgressDataColumn);
