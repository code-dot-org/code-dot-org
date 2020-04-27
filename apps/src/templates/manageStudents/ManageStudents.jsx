import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ManageStudentsTable from './ManageStudentsTable';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import {loadSectionStudentData} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

class ManageStudents extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number,
    isLoadingStudents: PropTypes.bool.isRequired,
    loadSectionStudentData: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.loadSectionStudentData(this.props.sectionId);
  }

  render() {
    const {sectionId, studioUrlPrefix, isLoadingStudents} = this.props;

    return (
      <div>
        {isLoadingStudents && <Spinner />}
        {!isLoadingStudents && (
          <div>
            <SyncOmniAuthSectionControl sectionId={sectionId} />
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
    sectionId: state.sectionData.section.id,
    isLoadingStudents: state.manageStudents.isLoadingStudents
  }),
  dispatch => ({
    loadSectionStudentData(sectionId) {
      dispatch(loadSectionStudentData(sectionId));
    }
  })
)(ManageStudents);
