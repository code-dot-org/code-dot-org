import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {getFullName} from '@cdo/apps/templates/manageStudents/utils.ts';
import i18n from '@cdo/locale';

import {studentLevelProgressType} from '../progress/progressTypes';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';

import ExpandedProgressColumnHeader from './ExpandedProgressColumnHeader.jsx';
import LevelDataCell, {getStudentRowHeaderId} from './LevelDataCell';

import styles from './progress-table-v2.module.scss';

function ExpandedProgressDataColumn({
  lesson,
  levelProgressByStudent,
  sortedStudents,
  expandedMetadataStudentIds,
  expandedChoiceLevelIds,
}) {
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
                expandedChoiceLevelIds.includes(level.id)
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
      expandedChoiceLevelIds,
      getSingleLevelColumn,
      getExpandedChoiceLevel,
    ]
  );

  return (
    <table key={lesson.id} className={styles.expandedColumn}>
      <caption hidden={true}>
        {i18n.progressForLesson({lessonName: lesson.title})}
      </caption>
      <ExpandedProgressColumnHeader lesson={lesson} />
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
  expandedMetadataStudentIds: PropTypes.array,
  expandedChoiceLevelIds: PropTypes.array.isRequired,
};

export const UnconnectedExpandedProgressDataColumn = ExpandedProgressDataColumn;

export default connect(state => ({
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
  expandedMetadataStudentIds: state.sectionProgress.expandedMetadataStudentIds,
  expandedChoiceLevelIds: state.sectionProgress.expandedChoiceLevelIds,
}))(ExpandedProgressDataColumn);
