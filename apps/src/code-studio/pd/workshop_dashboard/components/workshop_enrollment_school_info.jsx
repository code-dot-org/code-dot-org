import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import ConfirmationDialog from '../../components/confirmation_dialog';
import {enrollmentShape} from "../types";
import {workshopEnrollmentStyles as styles} from "../workshop_enrollment_styles";

const CSF = "CS Fundamentals";
const NA = "N/A";

export default class WorkshopEnrollmentSchoolInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingDelete: null
    };

    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleDeleteCanceled = this.handleDeleteCanceled.bind(this);
    this.handleDeleteConfirmed = this.handleDeleteConfirmed.bind(this);
  }

  handleClickDelete(event) {
    this.setState({
      pendingDelete: {
        id: event.currentTarget.dataset.id,
        email: event.currentTarget.dataset.email,
        first_name: event.currentTarget.dataset.first_name,
        last_name: event.currentTarget.dataset.last_name
      }
    });
  }

  handleDeleteCanceled() {
    this.setState({
      pendingDelete: null
    });
  }

  handleDeleteConfirmed() {
    const pendingDeleteId = this.state.pendingDelete.id;
    this.setState({
      pendingDelete: null
    });
    this.props.onDelete(pendingDeleteId);
  }

  render() {
    const enrollmentRows = this.props.enrollments.map((enrollment, i) => {
      let deleteCell;
      if (enrollment.attended) {
        // Don't give the option to delete an enrollment once the teacher has been marked attended.
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
          {this.props.workshopCourse === CSF && <td>{enrollment.role ? enrollment.role : NA}</td>}
          {this.props.workshopCourse === CSF && <td>{enrollment.grades_teaching ? enrollment.grades_teaching.join(', ') : NA}</td>}
          {this.props.accountRequiredForAttendance && <td>{enrollment.user_id ? 'Yes' : 'No'}</td>}
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
            {this.props.workshopCourse === CSF && <th style={styles.th}>Current Role</th>}
            {this.props.workshopCourse === CSF && <th style={styles.th}>Grades Teaching This Year</th>}
            {this.props.accountRequiredForAttendance && <th style={styles.th}>Code Studio Account?</th>}
          </tr>
        </thead>
        <tbody>
          {enrollmentRows}
        </tbody>
      </Table>
    );
  }
}

WorkshopEnrollmentSchoolInfo.propTypes = {
  enrollments: PropTypes.arrayOf(enrollmentShape).isRequired,
  accountRequiredForAttendance: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  workshopCourse: PropTypes.string.isRequired
};
