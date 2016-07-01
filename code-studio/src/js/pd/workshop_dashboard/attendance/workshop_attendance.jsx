/*
  Display and edit attendance for a workshop.
  It has a tab for each session which lists all enrolled teachers and their status.
  Route: /workshops/:workshopId/attendance(/:sessionIndex)
 */

import $ from 'jquery';
var _ = require('lodash');
import React from 'react';
var SessionTime = require('../components/session_time');
var SessionAttendance = require('./session_attendance');
var Row = require('react-bootstrap').Row;
var ButtonToolbar = require('react-bootstrap').ButtonToolbar;
var Button = require('react-bootstrap').Button;
var Tabs = require('react-bootstrap').Tabs;
var Tab = require('react-bootstrap').Tab;
var Col = require('react-bootstrap').Col;

var WorkshopAttendance = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    params: React.PropTypes.shape({
      workshopId: React.PropTypes.string.isRequired,
      sessionIndex: React.PropTypes.string
    }).isRequired
  },

  getInitialState: function () {
    return {
      loading: true,
      workshopState: undefined,
      sessionAttendances: undefined,
      adminActions: undefined,
      adminOverride: false
    };
  },

  componentDidMount: function () {
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
    }).done(function (data) {
      this.setState({
        loading: false,
        workshopState: data.state,
        sessionAttendances: data.session_attendances,
        adminActions: data.admin_actions
      });
    }.bind(this));
  },

  componentWillUnmount: function () {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
    if (this.saveRequest) {
      this.saveRequest.abort();
    }
  },

  handleNavSelect: function (sessionIndex) {
    this.context.router.replace(`/workshops/${this.props.params.workshopId}/attendance/${sessionIndex}`);
  },

  handleCancelClick: function (e) {
    this.context.router.push(`/workshops/${this.props.params.workshopId}`);
  },

  handleSaveClick: function (e) {
    var url = `/api/v1/pd/workshops/${this.props.params.workshopId}/attendance`;
    var data = this.prepareDataForApi();
    this.saveRequest = $.ajax({
      method: 'PATCH',
      url: url ,
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({pd_workshop: data})
    }).done(function () {
      this.context.router.push('/workshops/' + this.props.params.workshopId);
    }.bind(this));
  },

  prepareDataForApi: function () {
    // Convert to {session_attendances: [session_id, attendances: [user_id or email]]}
    return {
      session_attendances: this.state.sessionAttendances.map(function (sessionAttendance) {
        return {
          session_id: sessionAttendance.session.id,
          attendances: sessionAttendance.attendance.filter(function (attendance) {
            return attendance.attended;
          }).map(function (attendance) {
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

  handleAttendanceChange: function (i, value) {
    var clonedAttendances = _.cloneDeep(this.state.sessionAttendances);
    clonedAttendances[this.activeSessionIndex()].attendance[i].attended = value;
    this.setState({sessionAttendances: clonedAttendances});
  },

  activeSessionIndex: function () {
    return parseInt(this.props.params.sessionIndex, 10) || 0;
  },

  handleAdminOverrideClick: function () {
    this.setState({adminOverride: !this.state.adminOverride});
  },

  renderAdminControls: function () {
    if (!this.state.adminActions) {
      return null;
    }
    var toggleClass;
    var style;
    if (this.state.adminOverride) {
      toggleClass = "fa fa-toggle-on fa-lg";
      style = {backgroundColor: '#f5f5dc'}; // Light green
    } else {
      toggleClass = "fa fa-toggle-off fa-lg";
      style = {backgroundColor: '#f5f5f5'}; // Light gray
    }
    return (
      <Row>
        <Col sm={10} style={{padding: 10}}>
          <span style={style}>Admin: allow counting attendance for teachers not in the section? &nbsp;</span>
          <i className={toggleClass} style={{cursor:'pointer'}} onClick={this.handleAdminOverrideClick} />
        </Col>
      </Row>
    );
  },

  render: function () {
    if (this.state.loading) {
      return <i className="fa fa-spinner fa-pulse fa-3x" />;
    }

    let isReadOnly = this.state.workshopState === 'Ended';
    let sessionTabs = this.state.sessionAttendances.map(function (sessionAttendance, i) {
      var session = sessionAttendance.session;
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
    }.bind(this));

    let intro = null;
    if (isReadOnly) {
      intro = (
        <p>
          This workshop has ended. The attendance view is now read-only.
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
        <Tabs activeKey={this.activeSessionIndex()} onSelect={this.handleNavSelect}>
          {sessionTabs}
        </Tabs>
        <br />
        <Row>
          <Col sm={4}>
            <ButtonToolbar>
              <Button bsStyle="primary" onClick={this.handleSaveClick}>Save</Button>
              <Button onClick={this.handleCancelClick}>Cancel</Button>
            </ButtonToolbar>
          </Col>
        </Row>
      </div>
    );
  }
});
module.exports = WorkshopAttendance;
