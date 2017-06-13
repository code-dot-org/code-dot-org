/**
 * Display and edit attendance for a workshop.
 * It has a tab for each session which lists all enrolled teachers and their status.
 * Route: /workshops/:workshopId/attendance(/:sessionIndex)
 */

import $ from 'jquery';
import React from 'react';
import SessionTime from '../components/session_time';
import Spinner from '../components/spinner';
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
  adminOverride: {
    true: {
      cursor: 'pointer',
      backgroundColor: '#f5f5dc' // Light green
    },
    false: {
      cursor: 'pointer',
      backgroundColor: '#f5f5f5' // Light gray
    }
  },
  saveStatus: {
    error: {
      color: color.red
    }
  }
};

const WorkshopAttendance = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string.isRequired,
      sessionId: React.PropTypes.string
    }).isRequired
  },

  getInitialState() {
    return {
      loadingSummary: true,
      workshopState: undefined,
      sectionCode: undefined,
      sessions: undefined,
      adminOverride: false,
      numPendingSaves: 0,
      lastSaveFailed: false,
      accountRequiredForAttendance: true
    };
  },

  hasWorkshopEnded() {
    return this.state.workshopState === 'Ended';
  },

  componentWillMount() {
    this.permission = new Permission();
  },

  componentDidMount() {
    this.loadSummary();
    this.shouldUseNewAttendance = JSON.parse(window.dashboard.workshop.newAttendance);
  },

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
        sectionCode: data.section_code,
        sessions: data.sessions,
        accountRequiredForAttendance: data['account_required_for_attendance?'],
        course: data.course
      });
    });
  },

  componentWillUnmount() {
    if (this.loadSummaryRequest) {
      this.loadSummaryRequest.abort();
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
  },

  updateUrlWithSession(sessionId) {
    this.context.router.replace(`/workshops/${this.props.params.workshopId}/attendance/${sessionId}`);
  },

  handleNavSelect(sessionId) {
    this.updateUrlWithSession(sessionId);
  },

  handleBackClick() {
    this.context.router.push(`/workshops/${this.props.params.workshopId}`);
  },

  handleDownloadCsvClick() {
    window.open(`/api/v1/pd/workshops/${this.props.params.workshopId}/attendance.csv`);
  },

  // returns workshopId from the router params, in number form
  workshopId() {
    return parseInt(this.props.params.workshopId, 10);
  },

  // returns the active sessionId from the router params, in number form (or null if non specified).
  activeSessionId() {
    return this.props.params.sessionId ? parseInt(this.props.params.sessionId, 10) : null;
  },

  handleSaving() {
    const numPendingSaves = this.state.numPendingSaves + 1;
    this.setState({numPendingSaves});
  },

  handleSaved(value) {
    const lastSaveFailed = !!value.error;
    const numPendingSaves = this.state.numPendingSaves - 1;
    this.setState({
      numPendingSaves,
      lastSaveFailed
    });
  },

  handleAdminOverrideClick() {
    this.setState({adminOverride: !this.state.adminOverride});
  },

  renderAdminControls() {
    if (this.shouldUseNewAttendance || !this.state.accountRequiredForAttendance || !this.permission.isWorkshopAdmin) {
      return null;
    }
    const toggleClass = this.state.adminOverride ? "fa fa-toggle-on fa-lg" : "fa fa-toggle-off fa-lg";
    const style = styles.adminOverride[!!this.state.adminOverride];
    return (
      <Row>
        <Col sm={10} style={{padding: 10}}>
          <span style={style}>
            Admin: allow counting attendance for teachers not in the section? &nbsp;
          </span>
          <i
            className={toggleClass}
            style={style}
            onClick={this.handleAdminOverrideClick}
          />
        </Col>
      </Row>
    );
  },

  render() {
    if (this.state.loadingSummary) {
      return <Spinner/>;
    }

    const isReadOnly = this.hasWorkshopEnded() && !this.permission.isWorkshopAdmin;

    let intro = null;
    if (isReadOnly) {
      intro = (
        <p>
          This workshop has ended. The attendance view is now read-only.
        </p>
      );
    } else if (this.hasWorkshopEnded() && this.permission.isWorkshopAdmin) {
      intro = (
        <p>
          This workshop has ended. As an admin, you can still update attendance.
          Note this will not be reflected in the payment report if it's already gone out.
        </p>
      );
    } else if (this.shouldUseNewAttendance) {
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
            Note: as of May 20, 2017 participants no longer need to join a section to attend a workshop.
            If you would like to set up a section for your workshop to show them how to do this in class,
            you can set up a normal school section in your teacher dashboard.
          </p>
        </div>
      );
    } else if (this.state.sectionCode) {
      const joinUrl = this.state.accountRequiredForAttendance ?
        `${location.origin}/join/${this.state.sectionCode}` :
        `${location.origin}/pd/workshops/${this.workshopId()}/enroll`;
      intro = (
        <p>
          Remember to have your participants go to this address before taking attendance:
          <br/>
          <a href={joinUrl} target="_blank">{joinUrl}</a>
        </p>
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
        {isReadOnly ? null : this.renderAdminControls()}
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
          adminOverride={this.state.adminOverride}
          isReadOnly={isReadOnly}
          onSaving={this.handleSaving}
          onSaved={this.handleSaved}
          accountRequiredForAttendance={this.state.accountRequiredForAttendance}
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
});
export default WorkshopAttendance;
