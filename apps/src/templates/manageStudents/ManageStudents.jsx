import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import ManageStudentsTable from './ManageStudentsTable';
import SyncOmniAuthSectionControl from '@cdo/apps/lib/ui/SyncOmniAuthSectionControl';
import $ from 'jquery';
import {
  convertStudentServerData,
  setStudents
} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

class ManageStudents extends React.Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,
    pegasusUrlPrefix: PropTypes.string,

    // Provided by redux
    sectionId: PropTypes.number,
    loginType: PropTypes.string,
    setStudents: PropTypes.func.isRequired,
    studentData: PropTypes.object
  };

  state = {
    isLoading: true
  };

  componentDidMount() {
    // Don't load data if it's already stored in redux.
    const alreadyHaveStudentData =
      Object.values(this.props.studentData)[0] &&
      Object.values(this.props.studentData)[0].sectionId ===
        this.props.sectionId;
    if (!alreadyHaveStudentData) {
      $.ajax({
        method: 'GET',
        url: `/dashboardapi/sections/${this.props.sectionId}/students`,
        dataType: 'json'
      }).done(studentData => {
        const convertedStudentData = convertStudentServerData(
          studentData,
          this.props.loginType,
          this.props.sectionId
        );
        this.props.setStudents(convertedStudentData);
        this.setState({
          isLoading: false
        });
      });
    } else {
      this.setState({
        isLoading: false
      });
    }
  }

  render() {
    const {sectionId, studioUrlPrefix, pegasusUrlPrefix} = this.props;

    return (
      <div>
        {this.state.isLoading && <Spinner />}
        {!this.state.isLoading && (
          <div>
            <SyncOmniAuthSectionControl sectionId={sectionId} />
            <ManageStudentsTable
              studioUrlPrefix={studioUrlPrefix}
              pegasusUrlPrefix={pegasusUrlPrefix}
            />
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
    loginType: state.manageStudents.loginType,
    studentData: state.manageStudents.studentData
  }),
  dispatch => ({
    setStudents(studentData) {
      dispatch(setStudents(studentData));
    }
  })
)(ManageStudents);
