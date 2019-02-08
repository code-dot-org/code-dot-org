import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import TeacherDashboardHeader from './TeacherDashboardHeader';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import SectionLoginInfo from '@cdo/apps/templates/teacherDashboard/SectionLoginInfo';

export default class TeacherDashboard extends Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string.isRequired,
    pegasusUrlPrefix: PropTypes.string.isRequired,
    sectionName: PropTypes.string.isRequired,

    // Provided by React router in parent.
    location: PropTypes.object.isRequired
  };

  render() {
    const {
      location,
      studioUrlPrefix,
      pegasusUrlPrefix,
      sectionName
    } = this.props;

    // Include header components unless we are on the /login_info page.
    const includeHeader = location.pathname !== '/login_info';

    return (
      <div>
        {includeHeader && <TeacherDashboardHeader sectionName={sectionName} />}
        <Switch>
          <Route path="/stats" component={props => <StatsTableWithData />} />
          <Route path="/progress" component={props => <SectionProgress />} />
          <Route
            path="/manage_students"
            component={props => (
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path="/projects"
            component={props => (
              <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix} />
            )}
          />
          <Route
            path="/text_responses"
            component={props => <TextResponses />}
          />
          <Route
            path="/assessments"
            component={props => <SectionAssessments />}
          />
          <Route
            path="/login_info"
            component={props => (
              <SectionLoginInfo
                studioUrlPrefix={studioUrlPrefix}
                pegasusUrlPrefix={pegasusUrlPrefix}
              />
            )}
          />
          {/* Render <ManageStudents/> by default */}
          <Route
            component={props => (
              <ManageStudents studioUrlPrefix={studioUrlPrefix} />
            )}
          />
        </Switch>
      </div>
    );
  }
}
