import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import {connect} from 'react-redux';
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

    // Include header components unless we are on the /login_info page.
    const includeHeader = location.pathname !== '/login_info';

    return (
      <div>
        {includeHeader && <TeacherDashboardHeader sectionName={sectionName} />}
        <Switch>
          <Route
            path="/manage_students"
            component={props => (
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          {/* Break out of switch if we have 0 students. Display a message directing user to go to "Manage Students" instead. */}
          {studentCount === 0 && (
            <Route
              component={props => <EmptySection sectionId={sectionId} />}
            />
          )}
          <Route path="/progress" component={props => <SectionProgress />} />
          <Route
            path="/text_responses"
            component={props => <TextResponses />}
          />
          <Route
            path="/assessments"
            component={props => <SectionAssessments />}
          />
          <Route
            path="/projects"
            component={props => (
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route path="/stats" component={props => <StatsTableWithData />} />
          <Route
            path="/login_info"
            component={props => (
              <SectionLoginInfo
                studioUrlPrefix={studioUrlPrefix}
                pegasusUrlPrefix={pegasusUrlPrefix}
              />
            )}
          />
          {/* Render Progress tab by default */}
          <Route component={props => <SectionProgress />} />
        </Switch>
      </div>
    );
  }
}

export const UnconnectedTeacherDashboard = TeacherDashboard;
export default connect(state => ({
  studentCount: getStudentCount(state)
}))(TeacherDashboard);
