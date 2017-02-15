import React from 'react';
import WorkshopTableLoader from '../workshop_dashboard/components/workshop_table_loader';
import { workshopShape } from '../workshop_dashboard/types.js'
import {Table} from 'react-bootstrap'

const UpcomingWorkshops = React.createClass({
  render() {
    return (
      <WorkshopTableLoader
        queryUrl="/api/v1/pd/workshops/?state=Not%20Started"
      >
        <UpcomingWorkshopsTable/>
      </WorkshopTableLoader>
    )
  }
});

const UpcomingWorkshopsTable = React.createClass({
  propTypes: {
    workshops: React.PropTypes.arrayOf(workshopShape)
  },

  renderWorkshopsTable() {
    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        {

        }
      </Table>
    )
  },

  render() {
    return (
      <div>
        <h2>
          Upcoming workshops
        </h2>
        {this.renderWorkshopsTable()}
      </div>
    )
  }
});

export default UpcomingWorkshops;