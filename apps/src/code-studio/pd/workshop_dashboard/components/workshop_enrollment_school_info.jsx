import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Table} from 'react-bootstrap';
import ConfirmationDialog from '../../components/confirmation_dialog';
import {enrollmentShape} from '../types';
import {workshopEnrollmentStyles as styles} from '../workshop_enrollment_styles';
import {ScholarshipDropdown} from '../../components/scholarshipDropdown';
import Spinner from '../../components/spinner';
import {WorkshopAdmin, ProgramManager} from '../permission';
import {ScholarshipDropdownOptions} from '@cdo/apps/generated/pd/scholarshipInfoConstants';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

const CSF = 'CS Fundamentals';
const DEEP_DIVE = SubjectNames.SUBJECT_CSF_201;
const NA = 'N/A';
const LOCAL_SUMMER = SubjectNames.SUBJECT_SUMMER_WORKSHOP;

export class WorkshopEnrollmentSchoolInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pendingDelete: null,
      pendingScholarshipUpdates: [],
      enrollments: this.props.enrollments
    };

    this.handleClickDelete = this.handleClickDelete.bind(this);
    this.handleDeleteCanceled = this.handleDeleteCanceled.bind(this);
    this.handleDeleteConfirmed = this.handleDeleteConfirmed.bind(this);
    this.handleScholarshipStatusChange = this.handleScholarshipStatusChange.bind(
      this
    );
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

  handleScholarshipStatusChange(enrollment, selection) {
    this.setState(state => {
      const pendingScholarshipUpdates = state.pendingScholarshipUpdates.concat(
        enrollment.id
      );
      return {pendingScholarshipUpdates};
    });

    $.ajax({
      method: 'POST',
      url: `/api/v1/pd/enrollment/${enrollment.id}/scholarship_info`,
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify({scholarship_status: selection.value})
    }).done(data => {
      this.setState(state => {
        // replace the old version of the enrollment in state with the newly updated version we just got back
        const enrollments = state.enrollments.map(enrollment => {
          if (enrollment.id === data.id) {
            return data;
          } else {
            return enrollment;
          }
        });
        // remove the updated enrollment from the list of enrollments pending an update
        const pendingScholarshipUpdates = state.pendingScholarshipUpdates.filter(
          e => {
            return e !== data.id;
          }
        );
        return {enrollments, pendingScholarshipUpdates};
      });
    });
  }

  formatCsfCourseExperience(csf_course_experience) {
    if (!csf_course_experience) {
      return NA;
    }
    const strs = Object.keys(csf_course_experience).map(
      key => key + ': ' + csf_course_experience[key]
    );
    return strs.join(', ');
  }

  scholarshipInfo(enrollment) {
    if (enrollment.scholarship_ineligible_reason) {
      return <td>{enrollment.scholarship_ineligible_reason}</td>;
    }

    if (
      this.props.permissionList.has(ProgramManager) ||
      this.props.permissionList.has(WorkshopAdmin)
    ) {
      return (
        <td>
          <ScholarshipDropdown
            scholarshipStatus={enrollment.scholarship_status}
            onChange={this.handleScholarshipStatusChange.bind(this, enrollment)}
          />
        </td>
      );
    } else {
      let scholarshipInfo = ScholarshipDropdownOptions.find(o => {
        return o.value === enrollment.scholarship_status;
      });
      return <td>{scholarshipInfo ? scholarshipInfo.label : '--'}</td>;
    }
  }

  renderSelectCell(enrollment) {
    const checkBoxClass =
      this.props.selectedEnrollments.findIndex(e => e.id === enrollment.id) >= 0
        ? 'fa fa-check-square-o'
        : 'fa fa-square-o';
    return (
      <td>
        <div
          style={styles.contents}
          onClick={this.props.onClickSelect.bind(this, enrollment)}
        >
          <i className={checkBoxClass} />
        </div>
      </td>
    );
  }

  render() {
    const enrollmentRows = this.state.enrollments.map((enrollment, i) => {
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
          {this.props.permissionList.has(WorkshopAdmin) &&
            this.renderSelectCell(enrollment)}
          <td>{i + 1}</td>
          <td>{enrollment.first_name}</td>
          <td>{enrollment.last_name}</td>
          <td>{enrollment.email}</td>
          <td>{enrollment.district_name}</td>
          <td>{enrollment.school}</td>
          {this.props.workshopCourse === CSF && (
            <td>{enrollment.role ? enrollment.role : NA}</td>
          )}
          {this.props.workshopCourse === CSF && (
            <td>
              {enrollment.grades_teaching
                ? enrollment.grades_teaching.join(', ')
                : NA}
            </td>
          )}
          {this.props.workshopCourse === CSF &&
            this.props.workshopSubject === DEEP_DIVE && (
              <td>
                {this.formatCsfCourseExperience(
                  enrollment.csf_course_experience
                )}
              </td>
            )}
          {this.props.workshopCourse === CSF &&
            this.props.workshopSubject === DEEP_DIVE && (
              <td>
                {enrollment.csf_courses_planned
                  ? enrollment.csf_courses_planned.join(', ')
                  : NA}
              </td>
            )}
          {this.props.workshopCourse === CSF &&
            this.props.workshopSubject === DEEP_DIVE && (
              <td>{enrollment.attended_csf_intro_workshop}</td>
            )}
          {this.props.workshopCourse === CSF &&
            this.props.workshopSubject === DEEP_DIVE && (
              <td>{enrollment.csf_has_physical_curriculum_guide}</td>
            )}
          {this.props.workshopSubject === LOCAL_SUMMER && (
            <td>
              {enrollment.attendances} / {this.props.numSessions}
            </td>
          )}
          {this.props.scholarshipWorkshop &&
            this.state.pendingScholarshipUpdates.includes(enrollment.id) && (
              <td>
                <Spinner size="small" />
              </td>
            )}
          {this.props.scholarshipWorkshop &&
            !this.state.pendingScholarshipUpdates.includes(enrollment.id) &&
            this.scholarshipInfo(enrollment)}
        </tr>
      );
    });

    let confirmationDialog = null;
    const pendingDelete = this.state.pendingDelete;
    if (!!pendingDelete) {
      const bodyText =
        'Are you sure you want to delete the enrollment for ' +
        `${pendingDelete.first_name} ${pendingDelete.last_name} (${
          pendingDelete.email
        })?`;

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
            {this.props.permissionList.has(WorkshopAdmin) && (
              <th style={styles.th} />
            )}
            <th style={styles.th}>#</th>
            <th style={styles.th}>First Name</th>
            <th style={styles.th}>Last Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>District</th>
            <th style={styles.th}>School</th>
            {this.props.workshopCourse === CSF && (
              <th style={styles.th}>Current Role</th>
            )}
            {this.props.workshopCourse === CSF && (
              <th style={styles.th}>Grades Teaching This Year</th>
            )}
            {this.props.workshopCourse === CSF &&
              this.props.workshopSubject === DEEP_DIVE && (
                <th style={styles.th}>Prior CSF experience</th>
              )}
            {this.props.workshopCourse === CSF &&
              this.props.workshopSubject === DEEP_DIVE && (
                <th style={styles.th}>Courses Planning to Teach</th>
              )}
            {this.props.workshopCourse === CSF &&
              this.props.workshopSubject === DEEP_DIVE && (
                <th style={styles.th}>Attended Intro Workshop?</th>
              )}
            {this.props.workshopCourse === CSF &&
              this.props.workshopSubject === DEEP_DIVE && (
                <th style={styles.th}>Has Physical Copy of Curriculum?</th>
              )}
            {this.props.workshopSubject === LOCAL_SUMMER && (
              <th style={styles.th}>Total Attendance</th>
            )}
            {this.props.scholarshipWorkshop && (
              <th style={styles.th}>Scholarship Teacher?</th>
            )}
          </tr>
        </thead>
        <tbody>{enrollmentRows}</tbody>
      </Table>
    );
  }
}

WorkshopEnrollmentSchoolInfo.propTypes = {
  permissionList: PropTypes.object.isRequired,
  enrollments: PropTypes.arrayOf(enrollmentShape).isRequired,
  accountRequiredForAttendance: PropTypes.bool.isRequired,
  scholarshipWorkshop: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClickSelect: PropTypes.func.isRequired,
  workshopCourse: PropTypes.string.isRequired,
  workshopSubject: PropTypes.string.isRequired,
  numSessions: PropTypes.number.isRequired,
  selectedEnrollments: PropTypes.array
};

export default connect(state => ({
  permissionList: state.workshopDashboard.permission.permissions
}))(WorkshopEnrollmentSchoolInfo);
