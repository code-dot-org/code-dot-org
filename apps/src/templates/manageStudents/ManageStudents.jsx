import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SyncOmniAuthSectionControl from '@cdo/apps/accounts/SyncOmniAuthSectionControl';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {loadSectionStudentData} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

import ManageStudentsTable from './Table';

function ManageStudents({
  studioUrlPrefix,
  sectionId,
  isLoadingStudents,
  loadSectionStudentData,
  isLoadingSectionData,
}) {
  React.useEffect(() => {
    if (!isLoadingSectionData) {
      loadSectionStudentData(sectionId);
    }
  }, [sectionId, isLoadingSectionData, loadSectionStudentData]);

  return (
    <div data-testid={'manage-students-tab'}>
      {isLoadingStudents && <Spinner />}
      {!isLoadingStudents && (
        <div>
          <SyncOmniAuthSectionControl
            sectionId={sectionId}
            studioUrlPrefix={studioUrlPrefix}
          />
          <ManageStudentsTable studioUrlPrefix={studioUrlPrefix} />
        </div>
      )}
    </div>
  );
}

export const UnconnectedManageStudents = ManageStudents;

ManageStudents.propTypes = {
  studioUrlPrefix: PropTypes.string,

  // Provided by redux
  sectionId: PropTypes.number,
  isLoadingStudents: PropTypes.bool.isRequired,
  loadSectionStudentData: PropTypes.func.isRequired,
  isLoadingSectionData: PropTypes.bool.isRequired,
};

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    isLoadingStudents: state.manageStudents.isLoadingStudents,
    isLoadingSectionData: state.teacherSections.isLoadingSectionData,
  }),
  dispatch => ({
    loadSectionStudentData(sectionId) {
      dispatch(loadSectionStudentData(sectionId));
    },
  })
)(ManageStudents);
