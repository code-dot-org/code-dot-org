import React, {PropTypes, Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';

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
            component={props => <ManageStudentsTable studioUrlPrefix={studioUrlPrefix}/>
            }
          />
          <Route
            path="/projects"
            component={props => <SectionProjectsListWithData studioUrlPrefix={studioUrlPrefix}/>}
          />
          <Route
            path="/text_responses"
            component={props => <TextResponses/>}
          />
          <Route
            path="/assessments"
            component={props => <SectionAssessments/>}
          />
          {/* Render <SectionProgress/> by default */}
          <Route component={props => <SectionProgress/>} />
        </Switch>
      </div>
    );
  }
}
