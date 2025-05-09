import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import LessonProgressColumnHeader from './LessonProgressColumnHeader';

import styles from './progress-table-v2.module.scss';
import skeletonizeContent from '@cdo/apps/sharedComponents/skeletonize-content.module.scss';

const getId = (student, lesson) => student.id + '.' + lesson.id;

const skeletonContent = (
  <div
    className={classNames(
      styles.lessonSkeletonCell,
      skeletonizeContent.skeletonizeContent
    )}
  />
);

const getSkeletonCell = (id, key = undefined, index) => (
  <div
    className={classNames(
      styles.gridBox,
      styles.gridBoxLesson,
      index % 2 === 0 ? styles.lighterBackground : styles.darkerBackground
    )}
    key={key}
    // eslint-disable-next-line react/forbid-dom-props
    data-testid={'lesson-skeleton-cell-' + id}
  >
    {skeletonContent}
  </div>
);

const getMetadataExpandedSkeletonCell = (id, index) => (
  <div className={styles.lessonDataCellExpanded} key={id}>
    {getSkeletonCell(id)}
    <div
      className={classNames(
        styles.gridBox,
        styles.gridBoxMetadata,
        index % 2 === 0 ? styles.lighterBackground : styles.darkerBackground
      )}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid={'lesson-skeleton-cell-' + id + '-time-spent'}
    >
      {skeletonContent}
    </div>
    <div
      className={classNames(styles.gridBox, styles.gridBoxMetadata)}
      // eslint-disable-next-line react/forbid-dom-props
      data-testid={'lesson-skeleton-cell-' + id + '-last-updated'}
    >
      {skeletonContent}
    </div>
  </div>
);

function SkeletonProgressDataColumn({
  lesson,
  sortedStudents,
  expandedMetadataStudentIds,
}) {
  return (
    <div className={styles.lessonColumn} id="ui-test-skeleton-progress-column">
      <LessonProgressColumnHeader
        lesson={lesson}
        addExpandedLesson={() => {}}
      />
      <div className={styles.lessonDataColumn}>
        {sortedStudents.map((student, index) =>
          expandedMetadataStudentIds.includes(student.id)
            ? getMetadataExpandedSkeletonCell(getId(student, lesson), index)
            : getSkeletonCell(
                getId(student, lesson),
                getId(student, lesson),
                index
              )
        )}
      </div>
    </div>
  );
}

SkeletonProgressDataColumn.propTypes = {
  sortedStudents: PropTypes.array,
  lesson: PropTypes.object.isRequired,
  expandedMetadataStudentIds: PropTypes.array.isRequired,
};

export default connect(state => ({
  expandedMetadataStudentIds: state.sectionProgress.expandedMetadataStudentIds,
}))(SkeletonProgressDataColumn);
