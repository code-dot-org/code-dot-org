import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import SyncOmniAuthSectionControl from '@cdo/apps/accounts/SyncOmniAuthSectionControl';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {loadSectionStudentData} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';

import ManageStudentsTable from './ManageStudentsTable';

class ManageStudents extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number,
    isLoadingStudents: PropTypes.bool.isRequired,
    loadSectionStudentData: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.loadSectionStudentData(this.props.sectionId);
  }

  render() {
    const {sectionId, studioUrlPrefix, isLoadingStudents} = this.props;

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
}

export const UnconnectedManageStudents = ManageStudents;

export default connect(
  state => ({
    sectionId: state.teacherSections.selectedSectionId,
    isLoadingStudents: state.manageStudents.isLoadingStudents,
  }),
  dispatch => ({
    loadSectionStudentData(sectionId) {
      dispatch(loadSectionStudentData(sectionId));
    },
  })
)(ManageStudents);
