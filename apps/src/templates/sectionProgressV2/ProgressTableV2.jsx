import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentColumn from './StudentColumn';
import styles from './progress-table-v2.module.scss';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';
import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';
import {unitDataPropType} from '../sectionProgress/sectionProgressConstants';
import ExpandedProgressDataColumn from './ExpandedProgressDataColumn';
import LessonsProgressDataColumn from './LessonsProgressDataColumn';

export function ProgressTableV2({
  isSortedByFamilyName,
  sectionId,
  students,
  unitData,
}) {
  const [expandedLessonIds, setExpandedLessons] = React.useState([]);

  const addExpandedLesson = React.useMemo(
    () => lessonId =>
      setExpandedLessons([...expandedLessonIds, lessonId])[
        (expandedLessonIds, setExpandedLessons)
      ],
    [expandedLessonIds, setExpandedLessons]
  );
  const removeExpandedLesson = React.useMemo(
    () => lessonId =>
      setExpandedLessons(
        expandedLessonIds.filter(id => id !== lessonId),
        [setExpandedLessons, expandedLessonIds]
      ),
    [expandedLessonIds, setExpandedLessons]
  );

  const sortedStudents = React.useMemo(() => {
    return isSortedByFamilyName
      ? students.sort(stringKeyComparator(['familyName', 'name']))
      : students.sort(stringKeyComparator(['name', 'familyName']));
  }, [students, isSortedByFamilyName]);

  const renderedColumns = React.useMemo(() => {
    const lessons = unitData?.lessons;
    if (lessons === undefined || lessons.length === 0) {
      return [];
    }

    let currentGroup = [];
    let columns = [];
    for (const lesson of lessons) {
      if (expandedLessonIds.includes(lesson.id)) {
        if (currentGroup.length > 0) {
          columns.push(
            <LessonsProgressDataColumn
              lessons={currentGroup}
              sortedStudents={sortedStudents}
              addExpandedLesson={addExpandedLesson}
              key={columns.length}
            />
          );
          currentGroup = [];
        }
        columns.push(
          <ExpandedProgressDataColumn
            lesson={lesson}
            sortedStudents={sortedStudents}
            removeExpandedLesson={removeExpandedLesson}
            key={columns.length}
          />
        );
      } else {
        currentGroup.push(lesson);
      }
    }
    if (currentGroup.length > 0) {
      columns.push(
        <LessonsProgressDataColumn
          lessons={currentGroup}
          sortedStudents={sortedStudents}
          addExpandedLesson={addExpandedLesson}
          key={columns.length}
        />
      );
    }
    return columns;
  }, [
    unitData,
    expandedLessonIds,
    addExpandedLesson,
    removeExpandedLesson,
    sortedStudents,
  ]);

  return (
    <div className={styles.progressTableV2}>
      <StudentColumn
        sortedStudents={sortedStudents}
        unitName={unitData?.title}
        sectionId={sectionId}
      />

      <div className={styles.table}>
        <div className={styles.table}>{renderedColumns}</div>
      </div>
    </div>
  );
}

export const UnconnectedProgressTableV2 = ProgressTableV2;

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  students: PropTypes.arrayOf(studentShape).isRequired,
  unitData: unitDataPropType.isRequired,
};

export default connect(state => ({
  isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
  sectionId: state.teacherSections.selectedSectionId,
  students: state.teacherSections.selectedStudents,
  unitData: getCurrentUnitData(state),
}))(ProgressTableV2);
