import React from 'react';
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import moment from 'moment';
import MoveEnrollmentsDialog from './components/move_enrollments_dialog';
import Spinner from '../components/spinner';
import WorkshopEnrollment from './components/workshop_enrollment';
import WorkshopPanel from './WorkshopPanel';

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
    isMoveEnrollmentsDialogOpen: false,
    error: null
  };

  componentWillUnmount() {
    if (this.deleteEnrollmentRequest) {
      this.deleteEnrollmentRequest.abort();
    }
    if (this.moveEnrollmentRequest) {
      this.moveEnrollmentRequest.abort();
    }
  }

  handleEnrollmentRefreshClick = () => {
    this.props.loadEnrollments();
  };

  handleEnrollmentDownloadClick = () => {
    const {workshopId} = this.props;
    window.open(`/api/v1/pd/workshops/${workshopId}/enrollments.csv`);
  };

  handleClickMove = () => {
    this.setState({isMoveEnrollmentsDialogOpen: true});
  };

  handleMoveEnrollmentsCanceled = () => {
    this.setState({
      isMoveEnrollmentsDialogOpen: false
    });
  };

  handleMoveEnrollmentsConfirmed = destinationWorkshopId => {
    this.setState({
      isMoveEnrollmentsDialogOpen: false,
      selectedEnrollments: []
    });
    this.handleMoveEnrollments(
      destinationWorkshopId,
      this.state.selectedEnrollments
    );
  };

  handleMoveEnrollments = (destinationWorkshopId, selectedEnrollments) => {
    const {loadEnrollments} = this.props;
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
        loadEnrollments();
        this.moveEnrollmentRequest = null;
      })
      .fail(() => {
        this.setState({
          error: 'Error: unable to move enrollments'
        });
        loadEnrollments();
        this.moveEnrollmentRequest = null;
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
          onClick={this.handleEnrollmentRefreshClick}
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
            onClick={this.handleClickMove}
          >
            Move (admin)
            <MoveEnrollmentsDialog
              show={this.state.isMoveEnrollmentsDialogOpen}
              selectedEnrollments={this.state.selectedEnrollments}
              onCancel={this.handleMoveEnrollmentsCanceled}
              onMove={this.handleMoveEnrollmentsConfirmed}
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
      contents = (
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
