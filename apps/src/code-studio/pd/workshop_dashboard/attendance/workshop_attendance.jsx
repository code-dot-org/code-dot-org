/**
 * Display and edit attendance for a workshop.
 * It has a tab for each session which lists all enrolled teachers and their status.
 * Route: /workshops/:workshopId/attendance(/:sessionIndex)
 */

import $ from 'jquery';
import React, {PropTypes} from 'react';
import SessionTime from '../components/session_time';
import Spinner from '../../components/spinner';
import SessionAttendance from './session_attendance';
import Permission from '../../permission';
import color from '@cdo/apps/util/color';
import {
  Row,
  Col,
  ButtonToolbar,
  Button,
  Tabs,
  Tab
} from 'react-bootstrap';

const styles = {
  saveStatus: {
    error: {
      color: color.red
    }
  }
};

export default class WorkshopAttendance extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static propTypes = {
    params: PropTypes.shape({
      workshopId: PropTypes.string.isRequired,
      sessionId: PropTypes.string
    }).isRequired
  };

  state = {
    loadingSummary: true,
    workshopState: undefined,
    sessions: undefined,
    numPendingSaves: 0,
    lastSaveFailed: false,
    accountRequiredForAttendance: true
  };

  hasWorkshopEnded() {
    return this.state.workshopState === 'Ended';
  }

  componentWillMount() {
    this.permission = new Permission();
  }

  componentDidMount() {
    this.loadSummary();
  }

  loadSummary() {
    this.loadSummaryRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/summary`,
      dataType: "json"
    }).done(data => {
      // No session Id, or an invalid session Id in the Url? Redirect to the first one.
      if (!this.activeSessionId() || !data.sessions.find(s => s.id === this.activeSessionId())) {
        this.updateUrlWithSession(data.sessions[0].id);
      }
      this.setState({
        loadingSummary: false,
        workshopState: data.state,
        sessions: data.sessions,
        accountRequiredForAttendance: data['account_required_for_attendance?'],
        course: data.course,
        enrollmentCount: data.enrollment_count
      });
    });
  }

  componentWillUnmount() {
    if (this.loadSummaryRequest) {
      this.loadSummaryRequest.abort();
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
  }

  updateUrlWithSession(sessionId) {
    this.context.router.replace(`/workshops/${this.props.params.workshopId}/attendance/${sessionId}`);
  }

  handleNavSelect = (sessionId) => {
    this.updateUrlWithSession(sessionId);
  };

  handleBackClick = () => {
    this.context.router.push(`/workshops/${this.props.params.workshopId}`);
  };

  handleDownloadCsvClick = () => {
    window.open(`/api/v1/pd/workshops/${this.props.params.workshopId}/attendance.csv`);
  };

  // returns workshopId from the router params, in number form
  workshopId() {
    return parseInt(this.props.params.workshopId, 10);
  }

  // returns the active sessionId from the router params, in number form (or null if non specified).
  activeSessionId() {
    return this.props.params.sessionId ? parseInt(this.props.params.sessionId, 10) : null;
  }

  handleSaving = () => {
    const numPendingSaves = this.state.numPendingSaves + 1;
    this.setState({numPendingSaves});
  };

  handleSaved = (value) => {
    const lastSaveFailed = !!value.error;
    const numPendingSaves = this.state.numPendingSaves - 1;
    this.setState({
      numPendingSaves,
      lastSaveFailed
    });
  };

  render() {
    if (this.state.loadingSummary) {
      return <Spinner/>;
    }

    const isReadOnly = this.hasWorkshopEnded() && !this.permission.isWorkshopAdmin && !this.permission.isOrganizer;

    let intro = null;
    if (isReadOnly) {
      intro = (
        <p>
          This workshop has ended. The attendance view is now read-only.
        </p>
      );
    } else if (this.hasWorkshopEnded()) {
      intro = (
        <p>
          This workshop has ended. You can still update attendance, but note this will not be
          reflected in the payment report if it has already gone out.
        </p>
      );
    } else {
      const activeSession = this.state.sessions.find(s => s['open_for_attendance?']);
      const attendanceUrl = activeSession ? `${window.location.protocol}${window.dashboard.CODE_ORG_URL}/pd/${activeSession.code}` : null;
      intro = (
        <div>
          {attendanceUrl &&
            <p>
              To take attendance, direct your attendees to go to&nbsp;
              <a href={attendanceUrl} target="_blank">
                {attendanceUrl}
              </a>
            </p>
          }
          <p>
            Ask your participants to log into Code Studio and go to the link provided so they can
            get credit for attending your workshop today.&nbsp;
            <strong>
              Remember: they need to do this EVERY day of the workshop.
            </strong>&nbsp;
          </p>
          <p>
            You can double-check that they are marking themselves as attended by looking for their names below.
          </p>
        </div>
      );
    }

    const saveStatus = {};
    if (this.state.lastSaveFailed) {
      saveStatus.text = "Unable to save changes. Please try again.";
      saveStatus.style = styles.saveStatus.error;
    } else if (this.state.numPendingSaves > 0) {
      saveStatus.text = "Saving...";
    } else {
      saveStatus.text = "All changes have been saved.";
    }

    return (
      <div>
        <h1>
          Workshop Session Attendance
        </h1>
        {intro}
        <p style={saveStatus.style} >
          {saveStatus.text}
        </p>
        <Tabs activeKey={this.activeSessionId()} onSelect={this.handleNavSelect} id="attendance-tabs">
          {this.state.sessions.map((session) =>
            <Tab
              key={session.id}
              eventKey={session.id}
              title={<SessionTime session={session}/>}
            />
          )}
        </Tabs>
        <SessionAttendance
          workshopId={this.workshopId()}
          course={this.state.course}
          sessionId={this.activeSessionId()}
          isReadOnly={isReadOnly}
          onSaving={this.handleSaving}
          onSaved={this.handleSaved}
          accountRequiredForAttendance={this.state.accountRequiredForAttendance}
          enrollmentCount={this.state.enrollmentCount}
        />
        <Row>
          <Col sm={10}>
            <ButtonToolbar>
              <Button
                onClick={this.handleDownloadCsvClick}
              >
                Download CSV
              </Button>
              <Button onClick={this.handleBackClick}>Back</Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </div>
    );
  }
}
