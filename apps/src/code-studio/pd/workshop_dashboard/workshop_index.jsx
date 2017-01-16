/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import React from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import WorkshopTable from './components/workshop_table';
import WorkshopTableLoader from './components/workshop_table_loader';

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

  render() {
    const permission = window.dashboard.workshop.permission;
    const isAdmin = permission === "admin";
    const isFacilitator = permission.indexOf('facilitator') >= 0;
    const isOrganizer = permission.indexOf('organizer') >= 0;
    const isPlp = permission.indexOf('plp') >= 0;
    const showOrganizer = isAdmin;

    return (
      <div>
        <h1>Your Workshops</h1>
        <ButtonToolbar>
          <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
            New Workshop
          </Button>
          {(isAdmin || isOrganizer) && <Button onClick={this.handleAttendanceReportsClick}>Attendance Reports</Button>}
          {isPlp && <Button onClick={this.handleOrganizerSurveyResultsClick}>Organizer Survey Results</Button>}
          {isFacilitator && <Button onClick={this.handleSurveyResultsClick}>Facilitator Survey Results</Button>}
        </ButtonToolbar>
        <h2>In Progress</h2>
        <WorkshopTableLoader
          queryUrl="/api/v1/pd/workshops/?state=In%20Progress"
          canDelete
        >
          <WorkshopTable
            tableId="inProgressWorkshopsTable"
            showOrganizer={showOrganizer}
          />
        </WorkshopTableLoader>
        <h2>Upcoming</h2>
        <WorkshopTableLoader
          queryUrl="/api/v1/pd/workshops/?state=Not%20Started"
          canDelete
        >
          <WorkshopTable
            tableId="notStartedWorkshopsTable"
            canEdit
            showSignupUrl
            showOrganizer={showOrganizer}
          />
        </WorkshopTableLoader>
        <h2>Past</h2>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended">
          <WorkshopTable
            tableId="endedWorkshopsTable"
            showOrganizer={showOrganizer}
            surveyBaseUrl={isPlp ? "/organizer_survey_results" : "/survey_results"}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});
export default WorkshopIndex;
