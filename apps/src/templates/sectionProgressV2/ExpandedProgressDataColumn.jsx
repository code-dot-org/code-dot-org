import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import i18n from '@cdo/locale';

import {studentLevelProgressType} from '../progress/progressTypes';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';

import ExpandedProgressColumnHeader from './ExpandedProgressColumnHeader.jsx';
import LevelDataCell, {getStudentRowHeaderId} from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

const getFullName = student =>
  student.familyName ? `${student.name} ${student.familyName}` : student.name;

function ExpandedProgressDataColumn({
  lesson,
  levelProgressByStudent,
  sortedStudents,
  removeExpandedLesson,
  sectionId,
  expandedMetadataStudentIds,
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
    (level, studentId, propOverrides = {}) => {
      return (
        <LevelDataCell
          studentId={studentId}
          level={level}
          studentLevelProgress={levelProgressByStudent[studentId][level.id]}
          key={studentId + '.' + lesson.id + '.' + level.id}
          lessonId={lesson.id}
          metadataExpanded={expandedMetadataStudentIds.includes(studentId)}
          {...propOverrides}
        />
      );
    },
    [levelProgressByStudent, lesson, expandedMetadataStudentIds]
  );

  const getExpandedChoiceLevel = React.useCallback(
    (level, studentId) => [
      getSingleLevelColumn(level, studentId, {
        expandedChoiceLevel: true,
        className: styles.expandedLevelCellFirst,
      }),
      ...level.sublevels.map((sublevel, index) => {
        return getSingleLevelColumn(sublevel, studentId, {
          parentLevelId: level.id,
          className:
            index === level.sublevels.length - 1
              ? classNames(
                  styles.expandedLevelCellLast,
                  styles.expandedLevelCell
                )
              : styles.expandedLevelCell,
          linkClassName: styles.expandedChoiceLevelLink,
        });
      }),
    ],
    [getSingleLevelColumn]
  );

  const progress = React.useMemo(
    () => (
      <tbody className={styles.expandedTable}>
        {sortedStudents.map(student => (
          <tr className={styles.expandedLevelColumn} key={student.id}>
            <th hidden={true} id={getStudentRowHeaderId(student.id)}>
              {getFullName(student)}
            </th>
            {lesson.levels.flatMap(level => {
              if (
                level.sublevels?.length > 0 &&
                expandedChoiceLevels.includes(level.id)
              ) {
                return getExpandedChoiceLevel(level, student.id);
              }
              return [getSingleLevelColumn(level, student.id)];
            })}
          </tr>
        ))}
      </tbody>
    ),
    [
      lesson,
      sortedStudents,
      expandedChoiceLevels,
      getSingleLevelColumn,
      getExpandedChoiceLevel,
    ]
  );

  return (
    <table key={lesson.id} className={styles.expandedColumn}>
      <caption hidden={true}>
        {i18n.progressForLesson({lessonName: lesson.title})}
      </caption>
      <ExpandedProgressColumnHeader
        lesson={lesson}
        removeExpandedLesson={removeExpandedLesson}
        expandedChoiceLevels={expandedChoiceLevels}
        toggleExpandedChoiceLevel={toggleExpandedChoiceLevel}
      />
      {progress}
    </table>
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
  expandedMetadataStudentIds: PropTypes.array,
};

export const UnconnectedExpandedProgressDataColumn = ExpandedProgressDataColumn;

export default connect(state => ({
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
  expandedMetadataStudentIds: state.sectionProgress.expandedMetadataStudentIds,
}))(ExpandedProgressDataColumn);
