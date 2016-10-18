/**
 * Workshop Index. Displays workshop summaries and controls for CRUD actions.
 * Route: /workshops
 */
import React from 'react';
import {Button} from 'react-bootstrap';
import WorkshopTable from './components/workshop_table';
import WorkshopTableLoader from './components/workshop_table_loader';

const WorkshopIndex = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  handleNewWorkshopClick() {
    this.context.router.push('/workshops/new');
  },

  render() {
    const showOrganizer = window.dashboard.workshop.permission === "admin";
    return (
      <div>
        <h1>Your Workshops</h1>
        <p>
          <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
            New Workshop
          </Button>
        </p>
        <h2>In Progress</h2>
        <WorkshopTableLoader
          queryUrl="/api/v1/pd/workshops/?state=In%20Progress"
          canDelete
        >
          <WorkshopTable
            showOrganizer={showOrganizer}
          />
        </WorkshopTableLoader>
        <h2>Upcoming</h2>
        <WorkshopTableLoader
          queryUrl="/api/v1/pd/workshops/?state=Not%20Started"
          canDelete
        >
          <WorkshopTable
            canEdit
            showSignupUrl
            showOrganizer={showOrganizer}
          />
        </WorkshopTableLoader>
        <h2>Past</h2>
        <WorkshopTableLoader queryUrl="/api/v1/pd/workshops/?state=Ended">
          <WorkshopTable
            showOrganizer={showOrganizer}
          />
        </WorkshopTableLoader>
      </div>
    );
  }
});
export default WorkshopIndex;
