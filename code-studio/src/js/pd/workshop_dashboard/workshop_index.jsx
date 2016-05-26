/*
  Workshop Index. Displays workshop summaries and controls for CRUD actions.
  Route: /workshops
 */
import React from 'react';
var WorkshopTable = require('./components/workshop_table');
var Button = require('react-bootstrap').Button;

var WorkshopIndex = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  handleNewWorkshopClick: function (e) {
    this.context.router.push('/workshops/new');
  },

  render: function () {
    return (
      <div>
        <h1>Your Workshops</h1>
        <p>
          <Button className="btn-primary" onClick={this.handleNewWorkshopClick}>
            New Workshop
          </Button>
        </p>
        <h2>In Progress</h2>
        <WorkshopTable
          queryUrl="/api/v1/pd/workshops/?state=In%20Progress"
          canDelete
        />
        <h2>Upcoming</h2>
        <WorkshopTable
          queryUrl="/api/v1/pd/workshops/?state=Not%20Started"
          canEdit
          canDelete
        />
        <h2>Past</h2>
        <WorkshopTable
          queryUrl="/api/v1/pd/workshops/?state=Ended"
          canDelete
        />
      </div>
    );
  }
});
module.exports = WorkshopIndex;
