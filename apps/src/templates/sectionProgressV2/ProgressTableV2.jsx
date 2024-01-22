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
import LessonProgressDataColumn from './LessonProgressDataColumn';

const NUM_STUDENT_SKELETON_ROWS = 6;
const STUDENT_IDS = [...Array(NUM_STUDENT_SKELETON_ROWS).keys()];

function ProgressTableV2({
  isSortedByFamilyName,
  sectionId,
  students,
  unitData,
  expandedLessonIds,
  setExpandedLessons,
  isSkeleton,
}) {
  const sortedStudents = React.useMemo(() => {
    if (isSkeleton && students.length === 0) {
      return STUDENT_IDS.map(id => ({id}));
    }
    return isSortedByFamilyName
      ? students.sort(stringKeyComparator(['familyName', 'name']))
      : students.sort(stringKeyComparator(['name', 'familyName']));
  }, [students, isSortedByFamilyName, isSkeleton]);

  const renderedColumns = React.useMemo(() => {
    const lessons = unitData?.lessons;
    if (lessons === undefined || lessons.length === 0) {
      return [];
    }

    return lessons.map((lesson, index) => {
      if (expandedLessonIds.includes(lesson.id)) {
        return (
          <ExpandedProgressDataColumn
            lesson={lesson}
            sortedStudents={sortedStudents}
            removeExpandedLesson={lessonId =>
              setExpandedLessons(
                expandedLessonIds.filter(id => id !== lessonId)
              )
            }
            key={index}
          />
        );
      } else {
        return (
          <LessonProgressDataColumn
            lesson={lesson}
            sortedStudents={sortedStudents}
            addExpandedLesson={lessonId =>
              setExpandedLessons([...expandedLessonIds, lessonId])
            }
            key={index}
          />
        );
      }
    });
  }, [unitData, expandedLessonIds, setExpandedLessons, sortedStudents]);

  return (
    <div className={styles.progressTableV2}>
      <StudentColumn
        sortedStudents={sortedStudents}
        unitName={unitData?.title}
        sectionId={sectionId}
        isSkeleton={true} //isSkeleton && students.length === 0}
      />

      <div className={styles.table}>{renderedColumns}</div>
    </div>
  );
}

export const UnconnectedProgressTableV2 = ProgressTableV2;

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  students: PropTypes.arrayOf(studentShape),
  unitData: unitDataPropType,
  expandedLessonIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setExpandedLessons: PropTypes.func.isRequired,
  isSkeleton: PropTypes.bool,
};

export default connect(state => ({
  isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
  sectionId: state.teacherSections.selectedSectionId,
  students: state.teacherSections.selectedStudents,
  unitData: getCurrentUnitData(state),
}))(ProgressTableV2);
