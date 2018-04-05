/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {Button, ButtonToolbar} from 'react-bootstrap';
import ServerSortWorkshopTable from './components/server_sort_workshop_table';
import {
  PermissionPropType,
  WorkshopAdmin,
  Organizer,
  CsfFacilitator,
  Facilitator,
  Partner,
  ProgramManager
} from './permission';
import $ from 'jquery';

const FILTER_API_URL = "/api/v1/pd/workshops/filter";
const defaultFilters = {
  date_order: 'desc',
  limit: 5
};
const filterParams = {
  inProgress: {
    ...defaultFilters,
    limit: null, // Always show all 'In Progress' workshops
    state: 'In Progress'
  },
  notStarted: {
    ...defaultFilters,
    state: 'Not Started'
  },
  ended: {
    ...defaultFilters,
    state: 'Ended'
  }
};

export class WorkshopIndex extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  handleNewWorkshopClick = () => {
    this.context.router.push('/workshops/new');
  };

  handleAttendanceReportsClick = () => {
    this.context.router.push('/reports');
  };

  handleOrganizerSurveyResultsClick = () => {
    this.context.router.push('/organizer_survey_results');
  };

  handleSurveyResultsClick = () => {
    this.context.router.push('/survey_results');
  };

  handleFilterClick = (e) => {
    e.preventDefault();
    this.context.router.push('/workshops/filter');
  };

  generateFilterUrl(state) {
    return `/workshops/filter?${$.param({state})}`;
  }

  render() {
    const showOrganizer = this.props.permission.has(WorkshopAdmin);
    const canDelete = this.props.permission.hasAny(WorkshopAdmin, Organizer, ProgramManager);
    const canCreate = this.props.permission.hasAny(WorkshopAdmin, Organizer, ProgramManager, CsfFacilitator);
    const canSeeAttendanceReports = this.props.permission.hasAny(WorkshopAdmin, Organizer, ProgramManager);

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          {canCreate &&
            (
              <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
                New Workshop
              </Button>
            )
          }
          {canSeeAttendanceReports && <Button onClick={this.handleAttendanceReportsClick}>Attendance Reports</Button>}
          {this.props.permission.has(Partner) && <Button onClick={this.handleOrganizerSurveyResultsClick}>Organizer Survey Results</Button>}
          {this.props.permission.hasAny(Facilitator, CsfFacilitator) && <Button onClick={this.handleSurveyResultsClick}>Facilitator Survey Results</Button>}
          <Button
            href={this.context.router.createHref("/workshops/filter")}
            onClick={this.handleFilterClick}
          >
            Filter View
          </Button>
        </ButtonToolbar>
        <h2>In Progress</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.inProgress}
          canDelete={canDelete}
          tableId="inProgressWorkshopsTable"
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('In Progress')}
        />
        <h2>Upcoming</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.notStarted}
          canDelete={canDelete}
          tableId="notStartedWorkshopsTable"
          showSignupUrl
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('Not Started')}
        />
        <h2>Past</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.ended}
          tableId="endedWorkshopsTable"
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('Ended')}
        />
      </div>
    );
  }
}

export default connect(state => ({
  permission: state.permission
}))(WorkshopIndex);
