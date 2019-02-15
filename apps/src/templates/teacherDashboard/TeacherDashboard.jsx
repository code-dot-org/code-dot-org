import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';
import {TeacherDashboardPath} from './TeacherDashboardNavigation';
import {getStudentCount} from '@cdo/apps/templates/manageStudents/manageStudentsRedux';
import TeacherDashboardHeader from './TeacherDashboardHeader';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import SectionLoginInfo from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';
import EmptySection from './EmptySection';

class TeacherDashboard extends Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    pegasusUrlPrefix: PropTypes.string.isRequired,
    sectionId: PropTypes.number.isRequired,
    sectionName: PropTypes.string.isRequired,

    // Provided by React router in parent.
    location: PropTypes.object.isRequired,

    // Provided by redux.
    studentCount: PropTypes.number.isRequired
  };

  render() {
    const {
      location,
      studioUrlPrefix,
      pegasusUrlPrefix,
      sectionId,
      sectionName,
      studentCount
    } = this.props;

    if (!Object.values(TeacherDashboardPath).includes(location.pathname)) {
      location.pathname = TeacherDashboardPath.progress;
    }

    // Include header components unless we are on the /login_info page.
    const includeHeader = location.pathname !== TeacherDashboardPath.loginInfo;

    return (
      <div>
        {includeHeader && <TeacherDashboardHeader sectionName={sectionName} />}
        <Switch>
          <Route
            path={TeacherDashboardPath.manageStudents}
            component={props => (
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          {/* Break out of Switch if we have 0 students. Display EmptySection component instead. */}
          {studentCount === 0 && (
            <Route
              component={props => <EmptySection sectionId={sectionId} />}
            />
          )}
          <Route
            path={TeacherDashboardPath.progress}
            component={props => <SectionProgress />}
          />
          <Route
            path={TeacherDashboardPath.textResponses}
            component={props => <TextResponses />}
          />
          <Route
            path={TeacherDashboardPath.assessments}
            component={props => <SectionAssessments />}
          />
          <Route
            path={TeacherDashboardPath.projects}
            component={props => (
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path={TeacherDashboardPath.stats}
            component={props => <StatsTableWithData />}
          />
          <Route
            path={TeacherDashboardPath.loginInfo}
            component={props => (
              <SectionLoginInfo
                studioUrlPrefix={studioUrlPrefix}
                pegasusUrlPrefix={pegasusUrlPrefix}
              />
            )}
          />
        </Switch>
      </div>
    );
  }
}

export const UnconnectedTeacherDashboard = TeacherDashboard;
export default connect(state => ({
  studentCount: getStudentCount(state)
}))(TeacherDashboard);
