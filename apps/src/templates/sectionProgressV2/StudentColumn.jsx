import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export default function StudentColumn({sortedStudents}) {
  return (
    <div>
      <div>Student Column</div>
      <ul>
        {sortedStudents.map(student => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}

StudentColumn.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
};
