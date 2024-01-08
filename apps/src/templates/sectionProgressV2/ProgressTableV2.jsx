import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentColumn from './StudentColumn';
import ProgressTableHeader from './ProgressTableHeader';
import ProgressDataV2 from './ProgressDataV2';
import styles from './progress-table-v2.module.scss';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';

function ProgressTableV2({students, isSortedByFamilyName}) {
  const sortedStudents = React.useMemo(() => {
    const comparator = keys => stringKeyComparator(keys);
    return isSortedByFamilyName
      ? students.sort(comparator(['familyName', 'name']))
      : students.sort(comparator(['name', 'familyName']));
  }, [students, isSortedByFamilyName]);

  return (
    <div className={styles.progressTableV2}>
      <div>Progress Table V2</div>
      <ProgressTableHeader />
      <div className={styles.table}>
        <StudentColumn sortedStudents={sortedStudents} />
        <ProgressDataV2 sortedStudents={sortedStudents} />
      </div>
    </div>
  );
}

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  students: PropTypes.arrayOf(studentShape),
};

export default connect(
  state => ({
    isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
    students: state.teacherSections.selectedStudents,
  }),
  dispatch => ({})
)(ProgressTableV2);
