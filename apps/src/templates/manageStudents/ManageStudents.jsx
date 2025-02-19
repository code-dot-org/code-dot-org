import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SyncOmniAuthSectionControl from '@cdo/apps/accounts/SyncOmniAuthSectionControl';
import {asyncLoadCoursesWithProgress} from '@cdo/apps/redux/unitSelectionRedux';
import Spinner from '@cdo/apps/sharedComponents/Spinner';

import ManageStudentsTable from './Table';

function ManageStudents({
  studioUrlPrefix,
  sectionId,
  isLoadingStudents,
  asyncLoadCoursesWithProgress,
}) {
  React.useEffect(() => {
    // Load courses to enable student links to course page
    asyncLoadCoursesWithProgress();
  }, [asyncLoadCoursesWithProgress]);

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
  studioUrlPrefix: PropTypes.string,

  // Provided by redux
  sectionId: PropTypes.number,
  isLoadingStudents: PropTypes.bool.isRequired,
  asyncLoadCoursesWithProgress: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    isLoadingStudents: state.manageStudents.isLoadingStudents,
  }),
  dispatch => ({
    asyncLoadCoursesWithProgress() {
      dispatch(asyncLoadCoursesWithProgress());
    },
  })
)(ManageStudents);
