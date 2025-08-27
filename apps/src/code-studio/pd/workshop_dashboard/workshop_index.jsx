/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import $ from 'jquery';
import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {connect} from 'react-redux';

import {RouterContext} from '@cdo/apps/code-studio/legacyDashboardRoutingCompatibility';
import {
  DATE_ORDER_ASC,
  DATE_ORDER_DESC,
} from '@cdo/apps/code-studio/pd/constants';
import {BuildYourOwnWorkshopConfig} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import color from '@cdo/apps/util/color';

import ServerSortWorkshopTable from './components/server_sort_workshop_table';
import {
  PermissionPropType,
  WorkshopAdmin,
  Organizer,
  CsfFacilitator,
  Facilitator,
  ProgramManager,
} from './permission';
import SubmissionsDownloadForm from './reports/foorm/submissions_download_form';

const FILTER_API_URL = '/api/v1/pd/workshops/filter';
const defaultFilters = {
  limit: 5,
};
const filterParams = {
  inProgress: {
    ...defaultFilters,
    limit: null, // Always show all 'In Progress' workshops
    state: 'In Progress',
  },
  notStarted: {
    ...defaultFilters,
    state: 'Not Started',
  },
  ended: {
    ...defaultFilters,
    state: 'Ended',
  },
};

export class WorkshopIndex extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
  };

  static contextType = RouterContext;

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  handleNewWorkshopClick = (e, slug) => {
    e.preventDefault();
    this.context.router.push(`/workshops/new/${slug}`);
  };

  handleAttendanceReportsClick = e => {
    e.preventDefault();
    this.context.router.push('/reports');
  };

  handleLegacySurveySummariesClick = e => {
    e.preventDefault();
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
      ProgramManager
    );
    const canCreate = this.props.permission.hasAny(
      WorkshopAdmin,
      Organizer,
      ProgramManager
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
    const canExportSurveyResults = this.props.permission.has(WorkshopAdmin);

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          {canCreate && (
            <Button
              id="new-workshop-button"
              bsStyle="primary"
              style={styles.createWorkshopButton}
              href={`/pd/workshop_dashboard/workshops/new/${BuildYourOwnWorkshopConfig.slug}`}
              onClick={e =>
                this.handleNewWorkshopClick(e, BuildYourOwnWorkshopConfig.slug)
              }
            >
              <span>
                New Workshop&nbsp;&nbsp; <FontAwesomeV6Icon iconName="plus" />
              </span>
            </Button>
          )}

          {canSeeAttendanceReports && (
            <Button
              href={this.context.router.createHref('/reports')}
              onClick={this.handleAttendanceReportsClick}
            >
              Attendance Reports
            </Button>
          )}
          {canSeeLegacySurveySummaries && (
            <Button
              href={this.context.router.createHref('/legacy_survey_summaries')}
              onClick={this.handleLegacySurveySummariesClick}
            >
              Legacy Facilitator Survey Summaries
            </Button>
          )}
          <Button
            href={this.context.router.createHref('/workshops/filter')}
            onClick={this.handleFilterClick}
          >
            Filter View
          </Button>
          {canExportSurveyResults && (
            <SubmissionsDownloadForm>
              <Button style={styles.surveySubmissionsButton}>
                Export Survey Results
              </Button>
            </SubmissionsDownloadForm>
          )}
        </ButtonToolbar>
        <h2>In Progress</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.inProgress}
          canDelete={canDelete}
          tableId="inProgressWorkshopsTable"
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('In Progress')}
          initialOrderBy={DATE_ORDER_DESC}
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
          initialOrderBy={DATE_ORDER_ASC}
        />
        <h2>Past</h2>
        <ServerSortWorkshopTable
          queryUrl={FILTER_API_URL}
          queryParams={filterParams.ended}
          tableId="endedWorkshopsTable"
          showOrganizer={showOrganizer}
          moreUrl={this.generateFilterUrl('Ended')}
          initialOrderBy={DATE_ORDER_DESC}
        />
      </div>
    );
  }
}

const styles = {
  createWorkshopButton: {
    backgroundColor: color.purple,
  },
  surveySubmissionsButton: {
    marginLeft: 5,
  },
};

export default connect(state => ({
  permission: state.workshopDashboard.permission,
}))(WorkshopIndex);
