import React, {PropTypes, Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';

export default class TeacherDashboard extends Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string
  };

  render() {
    const {studioUrlPrefix} = this.props;

    return (
      <div>
        <TeacherDashboardNavigation/>
        <Switch>
          <Route
            path="/stats"
            component={props => <StatsTableWithData/>}
          />
          <Route
            path="/progress"
            component={props => <SectionProgress/>}
          />
          <Route
            path="/manage_students"
            component={props => <ManageStudentsTable {...props} studioUrlPrefix={studioUrlPrefix}/>
            }
          />
          <Route
            path="/projects"
            component={props => <SectionProjectsListWithData {...props} studioUrlPrefix={studioUrlPrefix}/>}
          />
          <Route
            path="/text_responses"
            component={props => <TextResponses/>}
          />
          <Route
            path="/assessments"
            component={props => <div>Assessments/Surveys content goes here!</div>}
          />
          <Route component={props => <div>Progress content goes here - default for now.</div>} />
        </Switch>
      </div>
    );
  }
}
