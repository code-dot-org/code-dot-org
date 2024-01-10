import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import {studentShape} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import StudentColumn from './StudentColumn';
import ProgressTableHeader from './ProgressTableHeader';
import ProgressDataV2 from './ProgressDataV2';
import styles from './progress-table-v2.module.scss';
import stringKeyComparator from '@cdo/apps/util/stringKeyComparator';
import {getCurrentUnitData} from '../sectionProgress/sectionProgressRedux';

function ProgressTableV2({
  isSortedByFamilyName,
  sectionId,
  students,
  unitName,
}) {
  const sortedStudents = React.useMemo(() => {
    return isSortedByFamilyName
      ? students.sort(stringKeyComparator(['familyName', 'name']))
      : students.sort(stringKeyComparator(['name', 'familyName']));
  }, [students, isSortedByFamilyName]);

  return (
    <div className={styles.progressTableV2}>
      <div>Progress Table V2</div>
      <ProgressTableHeader unitName={unitName} sectionId={sectionId} />
      <div className={styles.table}>
        <StudentColumn sortedStudents={sortedStudents} />
        <ProgressDataV2 sortedStudents={sortedStudents} />
      </div>
    </div>
  );
}

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  students: PropTypes.arrayOf(studentShape),
  unitName: PropTypes.string,
};

export default connect(
  state => ({
    isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
    sectionId: state.teacherSections.selectedSectionId,
    students: state.teacherSections.selectedStudents,
    unitName: getCurrentUnitData(state)?.title,
  }),
  dispatch => ({})
)(ProgressTableV2);
