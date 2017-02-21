import React from 'react';
import WorkshopTableLoader from '../workshop_dashboard/components/workshop_table_loader';
import {workshopShape} from '../workshop_dashboard/types.js';
import {Table} from 'react-bootstrap';
import moment from 'moment';
import {DATE_FORMAT, TIME_FORMAT} from '../workshop_dashboard/workshopConstants';

const UpcomingWorkshops = React.createClass({
  render() {
    return (
      <WorkshopTableLoader
        queryUrl="/api/v1/pd/workshops/?state=Not%20Started"
        hideNoWorkshopsMessage={true}
      >
        <UpcomingWorkshopsTable/>
      </WorkshopTableLoader>
    );
  }
});

const UpcomingWorkshopsTable = React.createClass({
  propTypes: {
    workshops: React.PropTypes.arrayOf(workshopShape)
  },

  renderWorkshopsTable() {
    const rows = this.props.workshops.map((workshop, i) => {
      return this.renderRowForWorkshop(workshop);
    });

    return (
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </Table>
    );
  },

  renderRowForWorkshop(workshop) {
    return (
      <tr key={workshop.id}>
        <td>
          {workshop.course}
          <br/>
          {workshop.subject}
        </td>
        <td>
          {
            workshop.sessions.map((session, i) => {
              return (
                <p key={i}>
                  {moment.utc(session.start).format(DATE_FORMAT)}
                </p>
              );
            })
          }
        </td>
        <td>
          {
            workshop.sessions.map((session, i) => {
              return (
                <p key={i}>
                  {
                    `${moment.utc(session.start).format(TIME_FORMAT)} -
                     ${moment.utc(session.end).format(TIME_FORMAT)}`
                  }
                </p>
              );
            })
          }
        </td>
        <td>
          <div>
            <p>{workshop.location_name}</p>
            <p>{workshop.location_address}</p>
          </div>
        </td>
      </tr>
    );
  },

  render() {
    return (
      <div>
        <h2>
          Upcoming workshops
        </h2>
        {this.renderWorkshopsTable()}
      </div>
    );
  }
});

export default UpcomingWorkshops;
