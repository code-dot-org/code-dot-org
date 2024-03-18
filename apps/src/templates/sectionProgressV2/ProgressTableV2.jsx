import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';

import {lessonHasLevels} from '../progress/progressHelpers';
import {unitDataPropType} from '../sectionProgress/sectionProgressConstants';
import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

import ExpandedProgressDataColumn from './ExpandedProgressDataColumn';
import FloatingScrollbar from './floatingScrollbar/FloatingScrollbar';
<<<<<<< HEAD
import LessonProgressDataColumn from './LessonProgressDataColumn';
import SkeletonProgressDataColumn from './SkeletonProgressDataColumn';
import StudentColumn from './StudentColumn';

import styles from './progress-table-v2.module.scss';
=======
import {studentLevelProgressType} from '../progress/progressTypes';
import {loadUnitProgress} from '../sectionProgress/sectionProgressLoader';
>>>>>>> origin/staging

const NUM_STUDENT_SKELETON_ROWS = 6;
const STUDENT_SKELETON_IDS = [...Array(NUM_STUDENT_SKELETON_ROWS).keys()];

const NUM_LESSON_SKELETON_COLUMNS = 20;
const LESSON_SKELETON_DATA = [...Array(NUM_LESSON_SKELETON_COLUMNS).keys()];

function ProgressTableV2({
  isSortedByFamilyName,
  sectionId,
  students,
  unitData,
  expandedLessonIds,
  setExpandedLessons,
  isSkeleton,
  unitId,
  levelProgressByStudent,
}) {
  // Filter out all students without progress and reload unit data.
  // This is most likely because a new student was added.
  const filteredStudents = React.useMemo(() => {
    return [...students].filter(
      student => isSkeleton || levelProgressByStudent[student.id]
    );
  }, [students, levelProgressByStudent, isSkeleton]);

  React.useEffect(() => {
    if (filteredStudents.length !== students.length) {
      loadUnitProgress(unitId, sectionId);
    }
  }, [filteredStudents, students, unitId, sectionId]);

  const sortedStudents = React.useMemo(() => {
    if (isSkeleton && filteredStudents.length === 0) {
      return STUDENT_SKELETON_IDS.map(id => ({id}));
    }
    return isSortedByFamilyName
      ? [...filteredStudents].sort(stringKeyComparator(['familyName', 'name']))
      : [...filteredStudents].sort(stringKeyComparator(['name', 'familyName']));
  }, [filteredStudents, isSortedByFamilyName, isSkeleton]);

  const tableRef = React.useRef();

  const getRenderedColumn = React.useCallback(
    (lesson, index) => {
      if (isSkeleton) {
        return (
          <SkeletonProgressDataColumn
            lesson={lesson}
            sortedStudents={sortedStudents}
            key={index}
          />
        );
      }
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
            addExpandedLesson={lesson => {
              if (!lesson.lockable && lessonHasLevels(lesson)) {
                setExpandedLessons([...expandedLessonIds, lesson.id]);
              }
            }}
            key={index}
          />
        );
      }
    },
    [isSkeleton, sortedStudents, expandedLessonIds, setExpandedLessons]
  );

  const table = React.useMemo(() => {
    if (isSkeleton && unitData === undefined) {
      const lessons = LESSON_SKELETON_DATA.map(id => ({id, isFake: true}));
      return (
        <div className={styles.tableLoading}>
          {lessons.map(getRenderedColumn)}
        </div>
      );
    }

    if (unitData?.lessons === undefined) {
      // TODO: add no lesson state
      return null;
    }

    return (
      <FloatingScrollbar childRef={tableRef}>
        <div
          className={classNames(
            styles.table,
            isSkeleton && styles.tableLoading
          )}
          ref={tableRef}
        >
          <div className={styles.tableInterior}>
            {unitData.lessons.map(getRenderedColumn)}
          </div>
        </div>
      </FloatingScrollbar>
    );
  }, [isSkeleton, getRenderedColumn, unitData, tableRef]);

  return (
    <div className={styles.progressTableV2}>
      <StudentColumn
        sortedStudents={sortedStudents}
        unitName={unitData?.title}
        sectionId={sectionId}
        isSkeleton={isSkeleton && students.length === 0}
      />
      {table}
    </div>
  );
}

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  students: PropTypes.arrayOf(studentShape),
  unitData: unitDataPropType,
  expandedLessonIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  setExpandedLessons: PropTypes.func.isRequired,
  isSkeleton: PropTypes.bool,
  unitId: PropTypes.number,
  levelProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLevelProgressType)
  ),
};

export default connect(state => ({
  isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
  sectionId: state.teacherSections.selectedSectionId,
  students: state.teacherSections.selectedStudents,
  unitData: getCurrentUnitData(state),
  unitId: state.unitSelection.scriptId,
  levelProgressByStudent:
    state.sectionProgress.studentLevelProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(ProgressTableV2);
