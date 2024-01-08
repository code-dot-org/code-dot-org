import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import styles from './progress-table-v2.module.scss';
import classNames from 'classnames';

export default function StudentColumn({sortedStudents}) {
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
    <div>
      <div>Student Column</div>
      <div className={styles.grid}>
        {sortedStudents.map((student, ind) => studentColumnBox(student, ind))}
      </div>
    </div>
  );
}

StudentColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
};
