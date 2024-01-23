import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import {studentLessonProgressType} from '../progress/progressTypes';
import {connect} from 'react-redux';
import LessonDataCell from './LessonDataCell';
import classNames from 'classnames';
import FontAwesome from '../FontAwesome';
import {lessonHasLevels} from '../progress/progressHelpers';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

const getSkeletonLessonColumn = (lessonId, sortedStudents) => {
  return (
    <div className={styles.lessonColumn} key={lessonId}>
      <div
        className={classNames(styles.gridBox, styles.lessonHeaderCell)}
        key={lessonId}
      >
        <div
          className={classNames(
            styles.lessonSkeletonHeaderCell,
            skeletonizeContent.skeletonizeContent
          )}
        />
      </div>
      <div className={styles.lessonDataColumn}>
        {sortedStudents.map(student => (
          <div
            className={classNames(styles.gridBox, styles.gridBoxLesson)}
            key={student.id + '.' + lessonId}
          >
            <div
              className={classNames(
                styles.lessonSkeletonCell,
                skeletonizeContent.skeletonizeContent
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const getUninteractiveLessonColumnHeader = lesson => {
  return (
    <div
      className={classNames(styles.gridBox, styles.lessonHeaderCell)}
      key={lesson.id}
    >
      {lesson.relative_position}
    </div>
  );
};

function LessonProgressDataColumn({
  lesson,
  lessonProgressByStudent,
  sortedStudents,
  addExpandedLesson,
  isSkeleton,
}) {
  const getHeader = React.useCallback(
    lesson => {
      if (!lessonHasLevels(lesson)) {
        return getUninteractiveLessonColumnHeader(lesson);
      }
      return (
        <div
          className={classNames(styles.gridBox, styles.lessonHeaderCell)}
          onClick={() => addExpandedLesson(lesson.id)}
        >
          <FontAwesome
            icon="caret-right"
            className={styles.lessonHeaderCaret}
          />
          {lesson.relative_position}
        </div>
      );
    },
    [addExpandedLesson]
  );

  const getProgress = React.useCallback(
    lesson => (
      <div className={styles.lessonDataColumn}>
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
    [lessonProgressByStudent, sortedStudents]
  );

  return (
    <div className={styles.lessonColumn}>
      {isSkeleton ? (
        getSkeletonLessonColumn(lesson.id, sortedStudents)
      ) : (
        <>
          {getHeader(lesson)}
          {getProgress(lesson)}
        </>
      )}
    </div>
  );
}

LessonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lessonProgressByStudent: PropTypes.objectOf(
    PropTypes.objectOf(studentLessonProgressType)
  ),
  isSkeleton: PropTypes.bool,
  lesson: PropTypes.object.isRequired,
  addExpandedLesson: PropTypes.func.isRequired,
};

export const UnconnectedLessonProgressDataColumn = LessonProgressDataColumn;

export default connect(state => ({
  lessonProgressByStudent:
    state.sectionProgress.studentLessonProgressByUnit[
      state.unitSelection.scriptId
    ],
}))(LessonProgressDataColumn);
