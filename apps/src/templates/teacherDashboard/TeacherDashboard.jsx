import React, {PropTypes, Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import SelectSectionDropdown from './SelectSectionDropdown';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import StatsTableWithData from './StatsTableWithData';
import SectionProgress from '@cdo/apps/templates/sectionProgress/SectionProgress';
import ManageStudents from '@cdo/apps/templates/manageStudents/ManageStudents';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import TextResponses from '@cdo/apps/templates/textResponses/TextResponses';
import SectionAssessments from '@cdo/apps/templates/sectionAssessments/SectionAssessments';
import PrintLoginCards from '@cdo/apps/templates/teacherDashboard/PrintLoginCards';

export default class TeacherDashboard extends Component {
  static propTypes = {
    studioUrlPrefix: PropTypes.string,

    // Provided by React router
    location: PropTypes.object,
  };

  render() {
    const {location, studioUrlPrefix} = this.props;
    // Include header components unless we are on the /print_login_cards page.
    const includeHeader = location.pathname !== "/print_login_cards";

    return (
      <div>
        {includeHeader &&
          <div>
            <SelectSectionDropdown/>
            <TeacherDashboardNavigation/>
          </div>
        }
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
            component={props => <ManageStudents studioUrlPrefix={studioUrlPrefix}/>}
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
          <Route
            path="/print_login_cards"
            component={props => <PrintLoginCards/>}
          />
          {/* Render <SectionProgress/> by default */}
          <Route component={props => <SectionProgress/>} />
        </Switch>
      </div>
    );
  }
}
