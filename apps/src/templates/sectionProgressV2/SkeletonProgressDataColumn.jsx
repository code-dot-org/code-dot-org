import React from 'react';
import PropTypes from 'prop-types';
import styles from './progress-table-v2.module.scss';
import {studentShape} from '../teacherDashboard/teacherSectionsRedux';
import classNames from 'classnames';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';
import LessonProgressColumnHeader from './LessonProgressColumnHeader';

const getSkeletonLessonData = (lessonId, sortedStudents) => (
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
);

export default function SkeletonProgressDataColumn({lesson, sortedStudents}) {
  return (
    <div className={styles.lessonColumn}>
      <LessonProgressColumnHeader
        lesson={lesson}
        addExpandedLesson={() => {}}
      />
      {getSkeletonLessonData(lesson.id, sortedStudents)}
    </div>
  );
}

SkeletonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
  lesson: PropTypes.object.isRequired,
};
