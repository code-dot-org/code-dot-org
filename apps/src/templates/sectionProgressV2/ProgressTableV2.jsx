import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentColumn from './StudentColumn';
import ProgressTableHeader from './ProgressTableHeader';
import ProgressDataV2 from './ProgressDataV2';
import styles from './progress-table-v2.module.scss';

function ProgressTableV2({students}) {
  return (
    <div className={styles.progressTableV2}>
      <div>Progress Table V2</div>
      <ProgressTableHeader />
      <div className={styles.table}>
        <StudentColumn sortedStudents={students} />
        <ProgressDataV2 sortedStudents={students} />
      </div>
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
