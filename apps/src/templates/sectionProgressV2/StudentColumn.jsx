import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

import SortByNameDropdown from '../SortByNameDropdown';

import styles from './progress-table-v2.module.scss';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

const skeletonCell = key => (
  <div className={classNames(styles.gridBox, styles.gridBoxStudent)} key={key}>
    <span
      className={classNames(
        skeletonizeContent.skeletonizeContent,
        styles.gridBoxSkeleton
      )}
      style={{width: _.random(30, 90) + '%'}}
      data-testid="skeleton-cell"
    />
  </div>
);

export default function StudentColumn({
  sortedStudents,
  unitName,
  sectionId,
  isSkeleton,
}) {
  const getFullName = student =>
    student.familyName ? `${student.name} ${student.familyName}` : student.name;

  const studentColumnBox = (student, ind) => {
    if (isSkeleton) {
      return skeletonCell(ind);
    }

    return (
      <div
        className={classNames(styles.gridBox, styles.gridBoxStudent)}
        key={ind}
      >
        {getFullName(student)}
      </div>
    );
  };

  return (
    <div className={styles.studentColumn}>
      <SortByNameDropdown
        sectionId={sectionId}
        unitName={unitName}
        source={SECTION_PROGRESS_V2}
        className={styles.sortDropdown}
      />
      <div className={styles.grid}>
        {sortedStudents.map((student, ind) => studentColumnBox(student, ind))}
      </div>
    </div>
  );
}

StudentColumn.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
  sortedStudents: PropTypes.array,
  isSkeleton: PropTypes.bool,
};
