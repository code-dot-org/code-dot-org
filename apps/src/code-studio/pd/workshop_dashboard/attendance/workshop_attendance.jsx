/**
 * Display and edit attendance for a workshop.
 * It has a tab for each session which lists all enrolled teachers and their status.
 * Route: /workshops/:workshopId/attendance(/:sessionIndex)
 */

import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import SessionTime from '../components/session_time';
import SessionAttendance from './session_attendance';
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
  }
};

const WorkshopAttendance = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string.isRequired,
      sessionIndex: React.PropTypes.string
    }).isRequired
  },

  getInitialState() {
    return {
      loading: true,
      workshopState: undefined,
      sessionAttendances: undefined,
      adminOverride: false,
      saving: false,
      isModified: false
    };
  },

  isAdmin() {
    return window.dashboard.workshop.permission === "admin";
  },

  hasWorkshopEnded() {
    return this.state.workshopState === 'Ended';
  },

  componentDidMount() {
    // Response format:
    // [
    //   state: _workshop state_,
    //   session: {id. start, end},
    //   attendances: [{name, email, enrolled, user_id, in_section, attended}]
    // ]
    this.loadRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${this.props.params.workshopId}/attendance`,
      dataType: "json"
    }).done(data => {
      this.setState({
        loading: false,
        workshopState: data.state,
        sessionAttendances: data.session_attendances
      });
    });
  },

  componentWillUnmount() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
  },

  handleNavSelect(sessionIndex) {
    this.context.router.replace(`/workshops/${this.props.params.workshopId}/attendance/${sessionIndex}`);
  },

  handleBackClick() {
    this.context.router.push(`/workshops/${this.props.params.workshopId}`);
  },

  handleSaveClick() {
    this.setState({saving: true});
    const url = `/api/v1/pd/workshops/${this.props.params.workshopId}/attendance`;
    const data = this.prepareDataForApi();
    this.saveRequest = $.ajax({
      method: 'PATCH',
      url: url ,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({pd_workshop: data})
    }).done(() => {
      this.setState({
        saving: false,
        isModified: false
      });
    });
  },

  handleDownloadCsvClick() {
    window.open(`/api/v1/pd/workshops/${this.props.params.workshopId}/attendance.csv`);
  },

  prepareDataForApi() {
    // Convert to {session_attendances: [session_id, attendances: [user_id or email]]}
    return {
      session_attendances: this.state.sessionAttendances.map(sessionAttendance => {
        return {
          session_id: sessionAttendance.session.id,
          attendances: sessionAttendance.attendance.filter(attendance => {
            return attendance.attended;
          }).map(attendance => {
            if (attendance.user_id) {
              return {id: attendance.user_id};
            }
            // For admin-override mode, the user may not have an account so use email.
            // In that case, an account will be created in the backend, invited by the admin.
            return {email: attendance.email};
          })
        };
      })
    };
  },

  handleAttendanceChange(i, value) {
    const clonedAttendances = _.cloneDeep(this.state.sessionAttendances);
    clonedAttendances[this.activeSessionIndex()].attendance[i].attended = value;
    this.setState({
      sessionAttendances: clonedAttendances,
      isModified: true
    });
  },

  activeSessionIndex() {
    return parseInt(this.props.params.sessionIndex, 10) || 0;
  },

  handleAdminOverrideClick() {
    this.setState({adminOverride: !this.state.adminOverride});
  },

  renderAdminControls() {
    if (!this.isAdmin()) {
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
    if (this.state.loading) {
      return <i className="fa fa-spinner fa-pulse fa-3x" />;
    }

    const isReadOnly = this.hasWorkshopEnded() && !this.isAdmin();
    const sessionTabs = this.state.sessionAttendances.map((sessionAttendance, i) => {
      const session = sessionAttendance.session;
      return (
        <Tab key={i} eventKey={i} title={<SessionTime session={session}/>}>
          <SessionAttendance
            sessionId={session.id}
            attendance={sessionAttendance.attendance}
            adminOverride={this.state.adminOverride}
            onChange={this.handleAttendanceChange}
            isReadOnly={isReadOnly}
          />
        </Tab>
      );
    });

    let intro = null;
    if (isReadOnly) {
      intro = (
        <p>
          This workshop has ended. The attendance view is now read-only.
        </p>
      );
    } else if (this.hasWorkshopEnded() && this.isAdmin()) {
      intro = (
        <p>
          This workshop has ended. As an admin, you can still update attendance.
          Note this will not be reflected in the payment report if it's already gone out.
        </p>
      );
    }

    return (
      <div>
        <h1>
          Workshop Session Attendance
        </h1>
        {intro}
        {isReadOnly ? null : this.renderAdminControls()}
        <Tabs activeKey={this.activeSessionIndex()} onSelect={this.handleNavSelect} id="attendance-tabs">
          {sessionTabs}
        </Tabs>
        <br />
        <Row>
          <Col sm={10}>
            <ButtonToolbar>
              <Button
                disabled={!this.state.isModified && !this.state.saving}
                bsStyle="primary"
                onClick={this.handleSaveClick}
              >
                Save
              </Button>
              <Button
                disabled={this.state.isModified}
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
