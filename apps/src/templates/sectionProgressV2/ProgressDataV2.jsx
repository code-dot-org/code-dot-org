import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

export default function ProgressDataV2({sortedStudents}) {
  return (
    <div>
      <div>Progress Data</div>
      <ul>
        {sortedStudents.map(student => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
}

ProgressDataV2.propTypes = {
  sortedStudents: PropTypes.arrayOf(studentShape),
};
