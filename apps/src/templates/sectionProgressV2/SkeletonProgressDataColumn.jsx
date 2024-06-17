import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import LessonProgressColumnHeader from './LessonProgressColumnHeader';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

function SkeletonProgressDataColumn({
  lesson,
  sortedStudents,
  expandedMetadataStudentIds,
}) {
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
              data-testid={`lesson-skeleton-cell-${student.id}`}
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
  expandedMetadataStudentIds: PropTypes.array,
};

export const UnconnectedSkeletonProgressDataColumn = SkeletonProgressDataColumn;

export default connect(state => ({
  expandedMetadataStudentIds: state.sectionProgress.expandedMetadataStudentIds,
}))(SkeletonProgressDataColumn);
