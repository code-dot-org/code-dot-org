import React, {PropTypes, Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import TeacherDashboardNavigation from './TeacherDashboardNavigation';
import StatsTableWithData from './StatsTableWithData';
import SectionProjectsListWithData from '@cdo/apps/templates/projects/SectionProjectsListWithData';
import ManageStudentsTable from '@cdo/apps/templates/manageStudents/ManageStudentsTable';
import {summarizedSectionShape} from '@cdo/apps/templates/teacherDashboard/shapes';

export default class TeacherDashboard extends Component {
  static propTypes = {
    section: summarizedSectionShape.isRequired,
    studioUrlPrefix: PropTypes.string
  };

  render() {
    const {section, studioUrlPrefix} = this.props;

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
            component={props => <div>Progress content goes here!</div>}
          />
          <Route
            path="/manage_students"
            component={props => <ManageStudentsTable  {...props} studioUrlPrefix={studioUrlPrefix}/>
            }
          />
          {/* TODO: (madelynkasula) refactor SectionProjectsListWithData to use section from redux */}
          <Route
            path="/projects"
            component={props => <SectionProjectsListWithData {...props} sectionId={section.id} studioUrlPrefix={studioUrlPrefix}/>}
          />
          <Route
            path="/text_responses"
            component={props => <div>Text responses content goes here!</div>}
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
