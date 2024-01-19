import PropTypes from 'prop-types';
import React from 'react';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import SortByNameDropdown from '../SortByNameDropdown';
import _ from 'lodash';
import skeleton from '@cdo/apps/componentLibrary/skeleton.module.scss';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function StudentColumn({
  sortedStudents,
  unitName,
  sectionId,
  isSkeleton,
}) {
  const getFullName = student =>
    student.familyName ? `${student.name} ${student.familyName}` : student.name;

  const studentColumnBox = (student, ind) => {
    if (isSkeleton)
      return (
        <div
          className={classNames(styles.gridBox, styles.gridBoxStudent)}
          key={ind}
        >
          <span
            style={{width: _.random(30, 90) + '%'}}
            className={skeleton.skeletonize}
          />
        </div>
      );

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
      <div className={styles.sortDropdown}>
        <SortByNameDropdown
          sectionId={sectionId}
          unitName={unitName}
          source={SECTION_PROGRESS_V2}
        />
      </div>
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
