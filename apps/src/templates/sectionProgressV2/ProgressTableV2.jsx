import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentColumn from './StudentColumn';

function ProgressTableV2({students}) {
  return (
    <div>
      <div>Progress Table V2</div>
      <StudentColumn sortedStudents={students} />
    </div>
  );
}

ProgressTableV2.propTypes = {
  students: PropTypes.arrayOf(studentShape),
};

export default connect(
  state => ({
    students: state.teacherSections.selectedStudents,
  }),
  dispatch => ({})
)(ProgressTableV2);
