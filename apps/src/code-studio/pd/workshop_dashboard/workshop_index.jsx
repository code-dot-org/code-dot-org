/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import ServerSortWorkshopTable from './components/server_sort_workshop_table';

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

const WorkshopIndex = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  handleNewWorkshopClick() {
    this.context.router.push('/workshops/new');
  },

  handleAttendanceReportsClick() {
    this.context.router.push('/reports');
  },

  handleOrganizerSurveyResultsClick() {
    this.context.router.push('/organizer_survey_results');
  },

  handleSurveyResultsClick() {
    this.context.router.push('/survey_results');
  },

  handleFilterClick(e) {
    e.preventDefault();
    this.context.router.push('/workshops/filter');
  },

  generateFilterUrl(state) {
    return `/workshops/filter?${$.param({state})}`;
  },

  render() {
    const permission = window.dashboard.workshop.permission;
    const isWorkshopAdmin = permission === "workshop_admin";
    const isFacilitator = permission.indexOf('facilitator') >= 0;
    const isOrganizer = permission.indexOf('organizer') >= 0;
    const isPlp = permission.indexOf('plp') >= 0;
    const showOrganizer = isWorkshopAdmin;

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
            New Workshop
          </Button>
          {(isWorkshopAdmin || isOrganizer) && <Button onClick={this.handleAttendanceReportsClick}>Attendance Reports</Button>}
          {isPlp && <Button onClick={this.handleOrganizerSurveyResultsClick}>Organizer Survey Results</Button>}
          {isFacilitator && <Button onClick={this.handleSurveyResultsClick}>Facilitator Survey Results</Button>}
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
          canDelete
          tableId="inProgressWorkshopsTable"
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('In Progress')}
        />
        <h2>Upcoming</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.notStarted}
          canDelete
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
});
export default WorkshopIndex;
