import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import LessonProgressColumnHeader from './LessonProgressColumnHeader';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

export default function SkeletonProgressDataColumn({lesson, sortedStudents}) {
  return (
    <div className={styles.lessonColumn}>
      <LessonProgressColumnHeader
        lesson={lesson}
        addExpandedLesson={() => {}}
      />
      <div className={styles.lessonDataColumn}>
        {sortedStudents.map(student => (
          <div
            className={classNames(styles.gridBox, styles.gridBoxLesson)}
            key={student.id + '.' + lesson.id}
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
}

SkeletonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.array,
  lesson: PropTypes.object.isRequired,
};
