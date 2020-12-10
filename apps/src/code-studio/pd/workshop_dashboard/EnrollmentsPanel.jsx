import $ from 'jquery';
import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import moment from 'moment';
import MoveEnrollmentsDialog from './components/move_enrollments_dialog';
import EditEnrollmentNameDialog from './components/edit_enrollment_name_dialog';
import Spinner from '../components/spinner';
import WorkshopEnrollment from './components/workshop_enrollment';
import WorkshopPanel from './WorkshopPanel';
import {SubjectNames} from '@cdo/apps/generated/pd/sharedWorkshopConstants';
import {
  useFoormSurvey,
  shouldShowSurveyResults
} from './workshop_summary_utils';

export const MOVE_ENROLLMENT_BUTTON_NAME = 'moveEnrollment';
export const EDIT_ENROLLMENT_NAME_BUTTON_NAME = 'editEnrollmentName';

/**
 * View and manage the list of teachers enrolled in a workshop.
 */
export default class EnrollmentsPanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.string,
    workshop: PropTypes.shape({
      ['account_required_for_attendance?']: PropTypes.bool,
      capacity: PropTypes.number,
      course: PropTypes.string,
      enrolled_teacher_count: PropTypes.number,
      ['scholarship_workshop?']: PropTypes.bool,
      sessions: PropTypes.array,
      subject: PropTypes.string
    }),
    enrollments: PropTypes.array,
    isLoadingEnrollments: PropTypes.bool,
    isWorkshopAdmin: PropTypes.bool,
    loadEnrollments: PropTypes.func.isRequired
  };

  state = {
    enrollmentActiveTab: 0,
    selectedEnrollments: [],
    enrollmentChangeDialogOpen: null,
    error: null
  };

  componentWillUnmount() {
    if (this.deleteEnrollmentRequest) {
      this.deleteEnrollmentRequest.abort();
    }
    if (this.moveEnrollmentRequest) {
      this.moveEnrollmentRequest.abort();
    }
    if (this.editEnrollmentRequest) {
      this.editEnrollmentRequest.abort();
    }
  }

  handleEnrollmentRefresh = () => {
    this.props.loadEnrollments();
  };

  handleEnrollmentDownloadClick = () => {
    const {workshopId} = this.props;
    window.open(`/api/v1/pd/workshops/${workshopId}/enrollments.csv`);
  };

  handleClickChangeEnrollments = event => {
    this.setState({enrollmentChangeDialogOpen: event.target.name});
  };

  handleChangeEnrollmentsCanceled = () => {
    this.setState({
      enrollmentChangeDialogOpen: null
    });
  };

  handleMoveEnrollmentsConfirmed = destinationWorkshopId => {
    this.handleMoveEnrollments(
      destinationWorkshopId,
      this.state.selectedEnrollments
    );
    this.setState({
      enrollmentChangeDialogOpen: null,
      selectedEnrollments: []
    });
  };

  handleMoveEnrollments = (destinationWorkshopId, selectedEnrollments) => {
    const enrollmentIds = selectedEnrollments.map(enrollment => {
      return enrollment.id;
    });
    const urlParams = `destination_workshop_id=${destinationWorkshopId}&enrollment_ids[]=${enrollmentIds.join(
      '&enrollment_ids[]='
    )}`;
    this.moveEnrollmentRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/enrollments/move?${urlParams}`,
      traditional: true
    })
      .done(() => {
        // reload
        this.handleEnrollmentRefresh();
        this.moveEnrollmentRequest = null;
      })
      .fail(() => {
        this.setState({
          error: 'Error: unable to move enrollments'
        });
        this.handleEnrollmentRefresh();
        this.moveEnrollmentRequest = null;
      });
  };

  handleEditEnrollmentConfirmed = updatedName => {
    this.handleEditEnrollment(updatedName, this.state.selectedEnrollments[0]);
    this.setState({
      enrollmentChangeDialogOpen: null,
      selectedEnrollments: []
    });
  };

  handleEditEnrollment = (updatedName, selectedEnrollment) => {
    let updatedNameSnakeCase = {
      first_name: updatedName.firstName,
      last_name: updatedName.lastName
    };

    this.editEnrollmentRequest = $.ajax({
      method: 'POST',
      url: `/api/v1/pd/enrollment/${selectedEnrollment.id}/edit`,
      contentType: 'application/json',
      data: JSON.stringify(updatedNameSnakeCase)
    })
      .done(() => {
        // reload
        this.handleEnrollmentRefresh();
        this.editEnrollmentRequest = null;
      })
      .fail(() => {
        this.setState({error: 'Error: unable to rename attendee'});
        this.handleEnrollmentRefresh();
        this.editEnrollmentRequest = null;
      });
  };

  handleClickSelect = enrollment => {
    if (
      this.state.selectedEnrollments.findIndex(e => e.id === enrollment.id) >= 0
    ) {
      this.setState(state => {
        const selectedEnrollments = state.selectedEnrollments.filter(e => {
          return e.id !== enrollment.id;
        });
        return {selectedEnrollments};
      });
    } else {
      this.setState(state => {
        state.selectedEnrollments.push({
          id: enrollment.id,
          email: enrollment.email,
          first_name: enrollment.first_name,
          last_name: enrollment.last_name
        });
      });
    }
  };

  handleEnrollmentActiveTabSelect = enrollmentActiveTab => {
    this.setState({enrollmentActiveTab});
  };

  handleDeleteEnrollment = id => {
    const {workshopId, loadEnrollments} = this.props;
    this.deleteEnrollmentRequest = $.ajax({
      method: 'DELETE',
      url: `/api/v1/pd/workshops/${workshopId}/enrollments/${id}`,
      dataType: 'json'
    }).done(() => {
      // reload
      loadEnrollments();
      this.deleteEnrollmentRequest = null;
    });
  };

  getViewSurveyUrl = (workshopId, course, subject, lastSessionDate) => {
    if (
      !['CS Discoveries', 'CS Principles', 'CS Fundamentals'].includes(course)
    ) {
      return null;
    }

    if (useFoormSurvey(subject, lastSessionDate)) {
      return `/pd/workshop_dashboard/workshop_daily_survey_results/${workshopId}`;
    } else if (subject === SubjectNames.SUBJECT_CSF_101) {
      // Pegasus-based results are no longer offered.
      return null;
    } else {
      return `/pd/workshop_dashboard/daily_survey_results/${workshopId}`;
    }
  };

  render() {
    const {
      workshopId,
      workshop,
      enrollments,
      isLoadingEnrollments,
      isWorkshopAdmin
    } = this.props;
    const header = (
      <div>
        Workshop Enrollment: {workshop.enrolled_teacher_count}/
        {workshop.capacity}
        <Button
          bsStyle="link"
          style={styles.linkButton}
          onClick={this.handleEnrollmentRefresh}
        >
          <i className="fa fa-refresh" />
        </Button>
        <Button
          bsStyle="link"
          style={styles.linkButton}
          onClick={this.handleEnrollmentDownloadClick}
        >
          <i className="fa fa-arrow-circle-down" />
        </Button>
        {isWorkshopAdmin && (
          <Button
            bsSize="xsmall"
            disabled={this.state.selectedEnrollments.length === 0}
            onClick={this.handleClickChangeEnrollments}
            name={MOVE_ENROLLMENT_BUTTON_NAME}
          >
            Move (admin)
            <MoveEnrollmentsDialog
              show={
                this.state.enrollmentChangeDialogOpen ===
                MOVE_ENROLLMENT_BUTTON_NAME
              }
              selectedEnrollments={this.state.selectedEnrollments}
              onCancel={this.handleChangeEnrollmentsCanceled}
              onMove={this.handleMoveEnrollmentsConfirmed}
            />
          </Button>
        )}{' '}
        {isWorkshopAdmin && (
          <Button
            bsSize="xsmall"
            disabled={this.state.selectedEnrollments.length !== 1}
            onClick={this.handleClickChangeEnrollments}
            name={EDIT_ENROLLMENT_NAME_BUTTON_NAME}
          >
            Edit name (admin)
            <EditEnrollmentNameDialog
              show={
                this.state.enrollmentChangeDialogOpen ===
                EDIT_ENROLLMENT_NAME_BUTTON_NAME
              }
              selectedEnrollment={this.state.selectedEnrollments[0]}
              onCancel={this.handleChangeEnrollmentsCanceled}
              onEdit={this.handleEditEnrollmentConfirmed}
            />
          </Button>
        )}
        <p style={styles.error}>{this.state.error}</p>
      </div>
    );

    let contents = null;
    if (isLoadingEnrollments) {
      contents = <Spinner />;
    } else {
      const firstSessionDate = moment
        .utc(workshop.sessions[0].start)
        .format('MMMM Do');

      const lastSessionDate = new Date(
        workshop.sessions[workshop.sessions.length - 1].end
      );

      let viewSurveyUrl = this.getViewSurveyUrl(
        workshopId,
        workshop.course,
        workshop.subject,
        lastSessionDate
      );

      contents = (
        <div>
          <WorkshopEnrollment
            workshopId={workshopId}
            workshopCourse={workshop.course}
            workshopSubject={workshop.subject}
            workshopDate={firstSessionDate}
            numSessions={workshop.sessions.length}
            enrollments={enrollments}
            onDelete={this.handleDeleteEnrollment}
            onClickSelect={this.handleClickSelect}
            accountRequiredForAttendance={
              workshop['account_required_for_attendance?']
            }
            scholarshipWorkshop={workshop['scholarship_workshop?']}
            activeTab={this.state.enrollmentActiveTab}
            onTabSelect={this.handleEnrollmentActiveTabSelect}
            selectedEnrollments={this.state.selectedEnrollments}
          />

          {viewSurveyUrl &&
            shouldShowSurveyResults(
              workshop.state,
              workshop.course,
              workshop.subject,
              lastSessionDate
            ) && (
              <Button bsSize="xsmall" href={viewSurveyUrl} target="_blank">
                View Survey Results
              </Button>
            )}
        </div>
      );
    }

    return <WorkshopPanel header={header}>{contents}</WorkshopPanel>;
  }
}

const styles = {
  linkButton: {
    color: 'inherit'
  },
  error: {
    color: 'red',
    display: 'inline',
    paddingLeft: '10px'
  }
};
