import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';
import SortByNameDropdown from '../SortByNameDropdown';
import {Heading6} from '@cdo/apps/componentLibrary/typography';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function StudentColumn({sortedStudents, unitName, sectionId}) {
  const getFullName = student =>
    student.familyName ? `${student.name} ${student.familyName}` : student.name;

  const studentColumnBox = (student, ind) => {
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
        <Heading6 className={styles.studentColumnHeading}>Students</Heading6>
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
  sortedStudents: PropTypes.arrayOf(studentShape),
};
