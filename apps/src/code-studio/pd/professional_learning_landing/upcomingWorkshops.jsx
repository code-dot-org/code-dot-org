import React from 'react';
import WorkshopTableLoader from '../workshop_dashboard/components/workshop_table_loader';
import {workshopShape} from '../workshop_dashboard/types.js';
import {Table, Button, Modal} from 'react-bootstrap';
import moment from 'moment';
import {DATE_FORMAT, TIME_FORMAT} from '../workshop_dashboard/workshopConstants';

const UpcomingWorkshops = React.createClass({
  render() {
    return (
      <WorkshopTableLoader
        queryUrl="/api/v1/pd/workshops_user_enrolled_in"
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

  getInitialState() {
    return {
      showCancelModal: false,
      enrollmentCodeToCancel: undefined
    };
  },

  cancelEnrollment(event) {
    window.location = `/pd/workshop_enrollment/${this.state.enrollmentCodeToCancel}/cancel`;
  },

  dismissCancelModal(event) {
    this.setState({
      showCancelModal: false,
      enrollmentCodeToCancel: undefined
    });
  },

  showCancelModal(enrollmentCode) {
    this.setState({
      showCancelModal: true,
      enrollmentCodeToCancel: enrollmentCode
    });
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
            <th/>
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
        <td>
          {workshop.enrollment_code &&
            (
              <div>
                <Button data-code={workshop.enrollment_code} onClick={() => this.showCancelModal(workshop.enrollment_code)}>
                  Cancel enrollment
                </Button>
                <Button onClick={() => window.open(`/pd/workshop_enrollment/${workshop.enrollment_code}`, '_blank')}>
                  Workshop Details
                </Button>
              </div>
            )
          }

        </td>
      </tr>
    );
  },

  render() {
    return (
      <div>
        <Modal show={this.state.showCancelModal} onHide={this.dismissCancelModal} style={{width: 560}}>
          <Modal.Body>
            Are you sure you want to cancel your enrollment in this course?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.cancelEnrollment} bsStyle="primary">
              Yes - cancel my enrollment
            </Button>
            <Button onClick={this.dismissCancelModal}>
              No - stay enrolled in this class
            </Button>
          </Modal.Footer>
        </Modal>
        <h2>
          My Upcoming Workshops
        </h2>
        {this.renderWorkshopsTable()}
      </div>
    );
  }
});

export {UpcomingWorkshops, UpcomingWorkshopsTable};
