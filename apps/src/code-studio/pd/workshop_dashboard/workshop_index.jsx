/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Button, ButtonToolbar} from 'react-bootstrap';
import ServerSortWorkshopTable from './components/server_sort_workshop_table';
import {
  PermissionPropType,
  WorkshopAdmin,
  Organizer,
  CsfFacilitator,
  Facilitator,
  ProgramManager
} from './permission';
import $ from 'jquery';

const FILTER_API_URL = '/api/v1/pd/workshops/filter';
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

  handleLegacySurveySummariesClick = () => {
    this.context.router.push('/legacy_survey_summaries');
  };

  handleFilterClick = e => {
    e.preventDefault();
    this.context.router.push('/workshops/filter');
  };

  generateFilterUrl(state) {
    return `/workshops/filter?${$.param({state})}`;
  }

  render() {
    const showOrganizer = this.props.permission.has(WorkshopAdmin);
    const canDelete = this.props.permission.hasAny(
      WorkshopAdmin,
      Organizer,
      ProgramManager,
      CsfFacilitator
    );
    const canCreate = this.props.permission.hasAny(
      WorkshopAdmin,
      Organizer,
      ProgramManager,
      CsfFacilitator
    );
    const canSeeAttendanceReports = this.props.permission.hasAny(
      WorkshopAdmin,
      Organizer,
      ProgramManager
    );
    const canSeeLegacySurveySummaries = this.props.permission.hasAny(
      Facilitator,
      CsfFacilitator
    );

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          {canCreate && (
            <Button
              className="btn-primary"
              onClick={this.handleNewWorkshopClick}
            >
              New Workshop
            </Button>
          )}
          {canSeeAttendanceReports && (
            <Button onClick={this.handleAttendanceReportsClick}>
              Attendance Reports
            </Button>
          )}
          {canSeeLegacySurveySummaries && (
            <Button onClick={this.handleLegacySurveySummariesClick}>
              Legacy Facilitator Survey Summaries
            </Button>
          )}
          <Button
            href={this.context.router.createHref('/workshops/filter')}
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
        <h2>Not Started</h2>
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
  permission: state.workshopDashboard.permission
}))(WorkshopIndex);
