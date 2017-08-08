/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import ServerSortWorkshopTable from './components/server_sort_workshop_table';
import Permission from '../permission';
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

const WorkshopIndex = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  componentWillMount() {
    this.permission = new Permission();
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
    const showOrganizer = this.permission.isWorkshopAdmin;

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          {(this.permission.isWorkshopAdmin || this.permission.isOrganizer) &&
            (
              <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
                New Workshop
              </Button>
            )
          }
          {(this.permission.isWorkshopAdmin || this.permission.isOrganizer) && <Button onClick={this.handleAttendanceReportsClick}>Attendance Reports</Button>}
          {this.permission.isPartner && <Button onClick={this.handleOrganizerSurveyResultsClick}>Organizer Survey Results</Button>}
          {this.permission.isFacilitator && <Button onClick={this.handleSurveyResultsClick}>Facilitator Survey Results</Button>}
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
