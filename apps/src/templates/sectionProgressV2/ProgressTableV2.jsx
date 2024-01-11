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
import {scriptDataPropType} from '../sectionProgress/sectionProgressConstants';

function ProgressTableV2({
  isSortedByFamilyName,
  sectionId,
  students,
  unitData,
}) {
  const sortedStudents = React.useMemo(() => {
    return isSortedByFamilyName
      ? students.sort(stringKeyComparator(['familyName', 'name']))
      : students.sort(stringKeyComparator(['name', 'familyName']));
  }, [students, isSortedByFamilyName]);

  return (
    <div className={styles.progressTableV2}>
      <StudentColumn
        sortedStudents={sortedStudents}
        unitName={unitData?.title}
        sectionId={sectionId}
      />
      <div className={styles.table}>
        <ProgressTableHeader lessons={unitData?.lessons} />
        <ProgressDataV2 sortedStudents={sortedStudents} />
      </div>
    </div>
  );
}

ProgressTableV2.propTypes = {
  isSortedByFamilyName: PropTypes.bool,
  sectionId: PropTypes.number,
  students: PropTypes.arrayOf(studentShape),
  unitData: scriptDataPropType.isRequired,
};

export default connect(
  state => ({
    isSortedByFamilyName: state.currentUser.isSortedByFamilyName,
    sectionId: state.teacherSections.selectedSectionId,
    students: state.teacherSections.selectedStudents,
    unitData: getCurrentUnitData(state),
  }),
  dispatch => ({})
)(ProgressTableV2);
