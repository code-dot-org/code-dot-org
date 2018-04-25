/**
 * Workshop view / edit. Displays and optionally edits details for a workshop.
 * Routes:
 *   /workshops/:workshopId
 *   /Workshops/:workshopId/edit
 */

import $ from 'jquery';
import _ from 'lodash';
import React, {PropTypes} from 'react';
import moment from 'moment';
import {
  Grid,
  Row,
  Col,
  Panel,
  ButtonToolbar,
  Button
} from 'react-bootstrap';
import {DATE_FORMAT} from './workshopConstants';
import ConfirmationDialog from './components/confirmation_dialog';
import WorkshopForm from './components/workshop_form';
import WorkshopEnrollment from './components/workshop_enrollment';
import Spinner from '../components/spinner';

const styles = {
  linkButton: {
    color:'inherit'
  },
  attendanceRow: {
    padding: '5px 0'
  },
  attendanceRowText: {
    fontSize: '14px',
    padding: '6px 0',
    margin: 1
  }
};

export default class Workshop extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired
    }).isRequired,
    route: PropTypes.shape({
      view: PropTypes.string
    }).isRequired,
  };

  constructor(props) {
    super(props);

    if (props.params.workshopId) {
      this.state = {
        loadingWorkshop: true,
        loadingEnrollments: true,
        enrollmentActiveTab: 0
      };
    }
  }

  componentDidMount() {
    this.loadWorkshop();
    this.loadEnrollments();
  }

  shouldComponentUpdate() {
    // Don't allow editing a workshop that has been started.
    if (this.props.route.view === 'edit' && this.state.workshop && this.state.workshop.state !== 'Not Started') {
      this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
      return false;
    }
    return true;
  }

  loadWorkshop() {
    this.loadWorkshopRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}`,
      dataType: "json"
    }).done(data => {
      this.setState({
        loadingWorkshop: false,
        workshop: _.pick(data, [
          'id',
          'organizer',
          'facilitators',
          'location_name',
          'location_address',
          'capacity',
          'enrolled_teacher_count',
          'on_map',
          'funded',
          'funding_type',
          'course',
          'subject',
          'notes',
          'sessions',
          'state',
          'account_required_for_attendance?',
          'ready_to_close?',
          'regional_partner_name',
          'regional_partner_id'
        ])
      });
    }).fail(data => {
      if (data.statusText !== "abort") {
        this.setState({
          loadingWorkshop: false,
          workshop: null
        });
      }
    });
  }

  loadEnrollments() {
    this.setState({loadingEnrollments: true});
    this.loadEnrollmentsRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments`,
      dataType: "json"
    }).done(data => {
      this.setState({
        loadingEnrollments: false,
        enrollments: data,
        workshop: _.merge(_.cloneDeep(this.state.workshop), {
          enrolled_teacher_count: data.length
        })
      });
    });
  }

  handleDeleteEnrollment = (id) => {
    this.deleteEnrollmentRequest = $.ajax({
      method: 'DELETE',
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments/${id}`,
      dataType: "json"
    }).done(() => {
      // reload
      this.loadEnrollments();
    });
  };

  componentWillUnmount() {
    if (this.loadWorkshopRequest) {
      this.loadWorkshopRequest.abort();
    }
    if (this.loadEnrollmentsRequest) {
      this.loadEnrollmentsRequest.abort();
    }
    if (this.deleteEnrollmentRequest) {
      this.deleteEnrollmentRequest.abort();
    }
    if (this.startRequest) {
      this.startRequest.abort();
    }
    if (this.endRequest) {
      this.endRequest.abort();
    }
  }

  handleStartWorkshopClick = () => {
    this.setState({showStartWorkshopConfirmation: true});
  };

  handleStartWorkshopCancel = () => {
    this.setState({showStartWorkshopConfirmation: false});
  };

  handleStartWorkshopConfirmed = () => {
    this.startRequest = $.ajax({
      method: "POST",
      url: "/api/v1/pd/workshops/" + this.props.params.workshopId + "/start",
      dataType: "json"
    }).done(() => {
      this.setState({showStartWorkshopConfirmation: false});
      this.loadWorkshop();
    }).fail(data => {
      if (data.statusText !== "abort") {
        console.log(`Failed to start workshop: ${this.props.params.workshopId}`);
        alert("We're sorry, we were unable to start the workshop. Please try again.");
      }
    });
  };

  handleEndWorkshopClick = () => {
    this.setState({showEndWorkshopConfirmation: true});
  };

  handleEndWorkshopCancel = () => {
    this.setState({showEndWorkshopConfirmation: false});
  };

  handleEndWorkshopConfirmed = () => {
    this.endRequest = $.ajax({
      method: "POST",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/end`,
      dataType: "json"
    }).done(() => {
      this.setState({showEndWorkshopConfirmation: false});
      this.loadWorkshop();
    }).fail(data => {
      if (data.statusText !== "abort") {
        console.log(`Failed to end workshop: ${this.props.params.workshopId}`);
        alert("We're sorry, we were unable to end the workshop. Please try again.");
      }
    });
  };

  getAttendanceUrl(sessionId) {
    return `/workshops/${this.props.params.workshopId}/attendance/${sessionId}`;
  }

  handleTakeAttendanceClick = (event) => {
    event.preventDefault();
    const sessionId = event.currentTarget.dataset.session_id;
    this.context.router.push(this.getAttendanceUrl(sessionId));
  };

  handleEditClick = () => {
    this.context.router.push(`/workshops/${this.props.params.workshopId}/edit`);
  };

  handleBackClick = () => {
    this.context.router.push('/workshops');
  };

  handleWorkshopSaved = (workshop) => {
    this.setState({workshop: workshop});
    this.context.router.replace(`/workshops/${this.props.params.workshopId}`);
  };

  handleSaveClick = () => {
    // This button is just a shortcut to click the Save button in the form component,
    // which will handle the logic.
    $('#workshop-form-save-btn').trigger('click');
  };

  handleEnrollmentRefreshClick = () => {
    this.loadEnrollments();
  };

  handleEnrollmentDownloadClick = () => {
    window.open(`/api/v1/pd/workshops/${this.props.params.workshopId}/enrollments.csv`);
  };

  handleEnrollmentActiveTabSelect = (enrollmentActiveTab) => {
    this.setState({enrollmentActiveTab});
  };

  getSessionAttendanceLink(session) {
    const url = this.getSessionAttendanceUrl(session);
    return (
      <a href={url} target="_blank">
        {url}
      </a>
    );
  }

  getSessionAttendanceUrl(session) {
    if (!session.code) {
      console.warn(`No attendance code found for session ${session.id}`);
      return null;
    }

    return `${window.location.protocol}${window.dashboard.CODE_ORG_URL}/pd/${session.code}`;
  }

  renderSignupPanel() {
    if (this.state.workshop.state !== 'Not Started') {
      return null;
    }

    const header = (
      <div>
        Your workshop sign-up link:
      </div>
    );

    const signupUrl = `${location.origin}/pd/workshops/${this.props.params.workshopId}/enroll`;
    const content = (
      <div>
        <p>Share this link with teachers who need to sign up for your workshop.</p>
        <a href={signupUrl} target="_blank">
          {signupUrl}
        </a>
      </div>
    );

    return this.renderPanel(header, content);
  }

  renderIntroPanel() {
    const header = (
      <div>
        Workshop State: {this.state.workshop.state}
      </div>
    );

    let contents = null;

    switch (this.state.workshop.state) {
      case 'Not Started': {
        const firstSessionStart = this.state.workshop.sessions[0].start;
        let buttonClass = null;
        if (moment().isSame(moment.utc(firstSessionStart), 'day')) {
          buttonClass = "btn-orange";
        }
        contents = (
          <div>
            <p>
              On the day of your workshop, click the Start Workshop button below.
            </p>
            <Button
              onClick={this.handleStartWorkshopClick}
              className={buttonClass}
            >
              Start Workshop
            </Button>
            <ConfirmationDialog
              show={this.state.showStartWorkshopConfirmation}
              onOk={this.handleStartWorkshopConfirmed}
              onCancel={this.handleStartWorkshopCancel}
              headerText="Start Workshop"
              bodyText="Are you sure you want to start this workshop?"
            />
          </div>
        );
        break;
      }
      case 'In Progress': {
        if (this.state.workshop['account_required_for_attendance?']) {
          contents = (
            <div>
              <p>
                On the day of the workshop, ask workshop attendees to follow the steps:
              </p>
              <h4>Step 1: Sign into Code Studio</h4>
              <p>
                Tell teachers to sign into their Code Studio accounts. If they do not already have an
                account tell them to create one by going to{' '}
                <a href={location.origin} target="_blank">
                  {location.origin}
                </a>
              </p>
              <h4>Step 2: Take attendance</h4>
              <p>
                After teachers have signed into their Code Studio accounts, use the attendance
                links below to take attendance.
              </p>
            </div>
          );
        } else { // account not required
          const signupUrl = `${location.origin}/pd/workshops/${this.props.params.workshopId}/enroll`;
          contents = (
            <div>
              <p>
                On the day of the workshop, ask workshop attendees to register if they haven't already:
              </p>
              <p>
                <a href={signupUrl} target="_blank">{signupUrl}</a>
              </p>
            </div>
          );
        }
        break;
      }
      default:
        contents = (
          <div>
            <p>
              We hope you had a great workshop!
            </p>
            <p>
              Teachers will receive an email with survey link from{' '}
              <a href="mailto:survey@code.org">
                survey@code.org
              </a>.{' '}
              If they do not receive the link ask them to check their spam.
              Many school districts block outside emails.
              You can also recommend they set hadi_partovi and any other @code.org
              addresses to their contacts or safe senders list, so they don't miss
              out on future emails. Lastly, they can check to make sure the email
              went to the correct email address by logging into their Code Studio
              account, navigating to the 'my account' page via the top right corner
              to confirm their email address was typed correctly when they
              first created the account.
            </p>
            <p>
              If they still can’t find the email, have them email{' '}
              <a href="mailto:support@code.org">
                support@code.org
              </a>{' '}
              and we will help them.
            </p>
          </div>
        );
    }

    return this.renderPanel(header, contents);
  }

  renderAttendancePanel() {
    if (this.state.workshop.state === 'Not Started') {
      return null;
    }

    const header = (
      <div>
        Take Attendance:
      </div>
    );

    const contents = this.renderAttendancePanelContents();
    return this.renderPanel(header, contents);
  }

  renderAttendancePanelContents() {
    return (
      <div>
        <p>
          There is a unique attendance URL for each day of your workshop. On each day of your
          workshop, your participants must visit that day's attendance URL to receive
          professional development credit. The attendance URL(s) will be shown below, 2 days in
          advance, for your convenience.
        </p>
        <Row>
          <Col md={2}>
            Date
          </Col>
          <Col md={4}>
            Attendance URL
          </Col>
          <Col md={4}>
            View Daily Roster
          </Col>
        </Row>
        {
          this.state.workshop.sessions.map(session => {
            const date = moment.utc(session.start).format(DATE_FORMAT);
            return (
              <Row key={session.id} style={styles.attendanceRow}>
                <Col md={2}>
                  <div style={styles.attendanceRowText}>
                    {date}
                  </div>
                </Col>
                <Col md={4}>
                  {session['show_link?'] &&
                  <div style={styles.attendanceRowText}>
                    {this.getSessionAttendanceLink(session)}
                  </div>
                  }
                </Col>
                <Col md={4}>
                  <Button
                    className={session['show_link?'] && session.attendance_count === 0 ? "btn-orange" : null}
                    data-session_id={session.id}
                    href={this.context.router.createHref(this.getAttendanceUrl(session.id))}
                    onClick={this.handleTakeAttendanceClick}
                  >
                    Attendance for&nbsp;
                    {date}
                  </Button>
                </Col>
              </Row>
            );
          })
        }
      </div>
    );
  }

  renderEndWorkshopPanel() {
    if (this.state.workshop.state !== 'In Progress') {
      return null;
    }

    const header = (
      <div>
        End Workshop:
      </div>
    );

    const contents = (
      <div>
        <p>
          After the last day of your workshop, you must end the workshop.
          This will generate a report to Code.org as well as email teachers
          a survey regarding the workshop.
        </p>
        <Button onClick={this.handleEndWorkshopClick}>End Workshop and Send Survey</Button>
        <ConfirmationDialog
          show={this.state.showEndWorkshopConfirmation}
          onOk={this.handleEndWorkshopConfirmed}
          okText={this.state.workshop['ready_to_close?'] ? "OK" : "Yes, end this workshop"}
          onCancel={this.handleEndWorkshopCancel}
          headerText="End Workshop and Send Survey"
          bodyText={this.state.workshop['ready_to_close?'] ?
            "Are you sure? Once ended, the workshop cannot be restarted."
            :
            "There are still sessions remaining in this workshop. " +
            "Once a workshop is ended, attendees can no longer mark themselves as attended for the remaining sessions. " +
            "Are you sure you want to end this workshop?"
          }
          width={this.state.workshop['ready_to_close?'] ? 500 : 800}
        />
      </div>
    );

    return this.renderPanel(header, contents);
  }

  renderDetailsPanelHeader() {
    let button = null;
    if (this.state.workshop.state === 'Not Started') {
      if (this.props.route.view === 'edit') {
        button = <Button bsSize="xsmall" bsStyle="primary" onClick={this.handleSaveClick}>Save</Button>;
      } else {
        button = <Button bsSize="xsmall" onClick={this.handleEditClick}>Edit</Button>;
      }
    }

    return (
      <span>
        Workshop Details: {button}
      </span>
    );
  }

  renderDetailsPanelContent() {
    if (this.props.route.view === 'edit' ) {
      return (
        <div>
          <WorkshopForm
            workshop={this.state.workshop}
            onSaved={this.handleWorkshopSaved}
          />
        </div>
      );
    }

    let editButton = null;
    if (this.state.workshop.state === 'Not Started') {
      editButton = (
        <Button onClick={this.handleEditClick}>Edit</Button>
      );
    }

    return (
      <div>
        <WorkshopForm workshop={this.state.workshop} readOnly>
          <Row>
            <Col sm={4}>
              <ButtonToolbar>
                {editButton}
                <Button onClick={this.handleBackClick}>Back</Button>
              </ButtonToolbar>
            </Col>
          </Row>
        </WorkshopForm>
      </div>
    );
  }

  renderDetailsPanel() {
    return this.renderPanel(this.renderDetailsPanelHeader(), this.renderDetailsPanelContent());
  }

  renderEnrollmentsPanel() {
    const header = (
      <div>
        Workshop Enrollment:{' '}
        {this.state.workshop.enrolled_teacher_count}/{this.state.workshop.capacity}
        <Button bsStyle="link" style={styles.linkButton} onClick={this.handleEnrollmentRefreshClick}>
          <i className="fa fa-refresh" />
        </Button>
        <Button bsStyle="link" style={styles.linkButton} onClick={this.handleEnrollmentDownloadClick}>
          <i className="fa fa-arrow-circle-down" />
        </Button>
      </div>
    );

    let contents = null;
    if (this.state.loadingEnrollments) {
      contents = <Spinner/>;
    } else {
      const firstSessionDate = moment.utc(this.state.workshop.sessions[0].start).format("MMMM Do");
      contents = (
        <WorkshopEnrollment
          workshopId={this.props.params.workshopId}
          workshopCourse={this.state.workshop.course}
          workshopDate={firstSessionDate}
          enrollments={this.state.enrollments}
          onDelete={this.handleDeleteEnrollment}
          accountRequiredForAttendance={this.state.workshop['account_required_for_attendance?']}
          activeTab={this.state.enrollmentActiveTab}
          onTabSelect={this.handleEnrollmentActiveTabSelect}
        />
      );
    }

    return this.renderPanel(header, contents);
  }

  renderPanel(header, content) {
    return (
      <Row>
        <Col sm={12}>
          <Panel header={header}>
            {content}
          </Panel>
        </Col>
      </Row>
    );
  }

  render() {
    if (this.state.loadingWorkshop) {
      return <Spinner/>;
    } else if (!this.state.workshop) {
      return <p>No workshop found</p>;
    }

    return (
      <Grid>
        {this.renderSignupPanel()}
        {this.renderIntroPanel()}
        {this.renderAttendancePanel()}
        {this.renderEndWorkshopPanel()}
        {this.renderEnrollmentsPanel()}
        {this.renderDetailsPanel()}
      </Grid>
    );
  }
}
