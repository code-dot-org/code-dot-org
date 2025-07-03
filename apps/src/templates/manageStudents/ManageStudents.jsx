import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SyncOmniAuthSectionControl from '@cdo/apps/accounts/SyncOmniAuthSectionControl';
import Spinner from '@cdo/apps/sharedComponents/Spinner';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import ManageStudentsTable from './Table';

function ManageStudents({sectionId, isLoadingStudents}) {
  const studioUrlPrefix = useAppSelector(
    state => state.teacherSections.studioUrlPrefix
  );
  return (
    // eslint-disable-next-line react/forbid-dom-props
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
  // Provided by redux
  sectionId: PropTypes.number,
  isLoadingStudents: PropTypes.bool.isRequired,
};

export default connect(state => ({
  sectionId: state.teacherSections.selectedSectionId,
  isLoadingStudents: state.manageStudents.isLoadingStudents,
}))(ManageStudents);
