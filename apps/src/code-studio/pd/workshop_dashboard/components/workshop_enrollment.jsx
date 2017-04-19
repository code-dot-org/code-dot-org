/**
 * Displays nicely-formatted session time for a workshop.
*/
import React from 'react';
import {Table} from 'react-bootstrap';
import _ from 'lodash';
import ConfirmationDialog from './confirmation_dialog';

const styles = {
  th: {
    backgroundImage: 'none',
    padding: 0,
    backgroundColor: 'white',
    fontFamily: '"Gotham 4r"',
    fontSize: 14
  },
  clickTarget: {
    cursor: 'pointer'
  }
};

const WorkshopEnrollment = React.createClass({
  propTypes: {
    enrollments: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        first_name: React.PropTypes.string.isRequired,
        last_name: React.PropTypes.string.isRequired,
        email: React.PropTypes.string.isRequired,
        district_name: React.PropTypes.string,
        school: React.PropTypes.string.isRequired,
        user_id: React.PropTypes.number,
        in_section: React.PropTypes.bool.isRequired,
      })
    ).isRequired,
    workshopId: React.PropTypes.string.isRequired,
    accountRequiredForAttendance: React.PropTypes.bool.isRequired,
    onDelete: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      pendingDelete: null
    };
  },

  handleClickDelete(event) {
    this.setState({
      pendingDelete: {
        id: event.currentTarget.dataset.id,
        email: event.currentTarget.dataset.email,
        first_name: event.currentTarget.dataset.first_name,
        last_name: event.currentTarget.dataset.last_name
      }
    });
  },

  handleDeleteCanceled() {
    this.setState({
      pendingDelete: null
    });
  },

  handleDeleteConfirmed() {
    const pendingDeleteId = this.state.pendingDelete.id;
    this.setState({
      pendingDelete: null
    });
    this.props.onDelete(pendingDeleteId);
  },

  render: function () {
    if (this.props.enrollments.length === 0) {
      const signupUrl = location.origin + "/pd/workshops/" + this.props.workshopId + '/enroll';
      const signupLink = <a href={signupUrl} target="_blank">{signupUrl}</a>;
      return (
        <div>
          No one is currently signed up for your workshop. Share your workshop sign-up
          link {signupLink} for teachers to enroll.
        </div>
      );
    }

    const sortedEnrollments = _.sortBy(this.props.enrollments, ['last_name', 'first_name']);
    const enrollmentRows = sortedEnrollments.map((enrollment, i) => {
      let deleteCell;
      if (enrollment.in_section) {
        // Don't give the option to delete an enrollment once the teacher has joined the section.
        deleteCell = <td />;
      } else {
        deleteCell = (
          <td
            style={styles.clickTarget}
            onClick={this.handleClickDelete}
            data-id={enrollment.id}
            data-first_name={enrollment.first_name}
            data-last_name={enrollment.last_name}
            data-email={enrollment.email}
          >
            <i className="fa fa-minus" />
          </td>
        );
      }

      return (
        <tr key={i}>
          {deleteCell}
          <td>{i + 1}</td>
          <td>{enrollment.first_name}</td>
          <td>{enrollment.last_name}</td>
          <td>{enrollment.email}</td>
          <td>{enrollment.district_name}</td>
          <td>{enrollment.school}</td>
          {this.props.accountRequiredForAttendance && <td>{enrollment.user_id ? 'Yes' : 'No'}</td>}
          {this.props.accountRequiredForAttendance && <td>{enrollment.in_section ? 'Yes' : 'No'}</td>}
        </tr>
      );
    });

    let confirmationDialog = null;
    const pendingDelete = this.state.pendingDelete;
    if (!!pendingDelete) {
      const bodyText = "Are you sure you want to delete the enrollment for " +
        `${pendingDelete.first_name} ${pendingDelete.last_name} (${pendingDelete.email})?`;

      confirmationDialog = (
        <ConfirmationDialog
          show={true}
          onOk={this.handleDeleteConfirmed}
          onCancel={this.handleDeleteCanceled}
          headerText="Delete Enrollment?"
          bodyText={bodyText}
        />
      );
    }

    return (
      <Table condensed striped>
        {confirmationDialog}
        <thead>
        <tr>
          <th style={styles.th} />
          <th style={styles.th}>#</th>
          <th style={styles.th}>First Name</th>
          <th style={styles.th}>Last Name</th>
          <th style={styles.th}>Email</th>
          <th style={styles.th}>District</th>
          <th style={styles.th}>School</th>
          {this.props.accountRequiredForAttendance && <th style={styles.th}>Code Studio Account?</th>}
          {this.props.accountRequiredForAttendance && <th style={styles.th}>Joined Section?</th>}
        </tr>
        </thead>
        <tbody>
        {enrollmentRows}
        </tbody>
      </Table>
    );
  }
});

export default WorkshopEnrollment;
