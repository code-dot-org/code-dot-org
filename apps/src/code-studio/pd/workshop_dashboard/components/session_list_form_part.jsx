/*
  Dynamic list of session inputs for creating and editing workshops.
 */
import React from 'react';
var moment = require('moment');
var SessionFormPart = require('./session_form_part');
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;

var MAX_SESSIONS = 10;

var SessionListFormPart = React.createClass({
  propTypes: {
    sessions: React.PropTypes.array.isRequired,
    onChange: React.PropTypes.func,
    shouldValidate: React.PropTypes.bool,
    readOnly: React.PropTypes.bool
  },

  nextPlaceholderId: 1,

  handleChange: function (i, session) {
    this.props.sessions[i] = session;
    this.props.onChange(this.props.sessions);
  },

  handleAdd: function () {
    let sessions = this.props.sessions;
    let lastSession = sessions[sessions.length - 1];
    let newSession = {
      // Placeholder Ids are needed to generate unique keys in the React list.
      // Prefix with _ so they don't conflict with actual Ids on sessions that have been saved.
      placeholderId: '_' + (this.nextPlaceholderId++),
      date: null,
      startTime: lastSession.startTime,
      endTime: lastSession.endTime
    };
    if (lastSession.date) {
      newSession.date = moment(lastSession.date, 'MM/DD/YY').add(1,'days').format('MM/DD/YY');
    }

    sessions.push(newSession);
    this.props.onChange(sessions);
  },

  handleRemove: function (i) {
    var sessions = this.props.sessions;
    var removedSession = sessions.splice(i, 1)[0];
    this.props.onChange(sessions, removedSession);
  },

  render: function () {
    var sessionForms = this.props.sessions.map(function (session, i, sessions) {
      var handleAdd = i === sessions.length-1 && sessions.length < MAX_SESSIONS ? this.handleAdd : null;
      var handleRemove = sessions.length > 1 ? this.handleRemove.bind(null, i) : null;
      return (
        <SessionFormPart
          readOnly={this.props.readOnly}
          session={session}
          key={session.id || session.placeholderId}
          onChange={this.handleChange.bind(null, i)}
          onAdd={handleAdd}
          onRemove={handleRemove}
          shouldValidate={this.props.shouldValidate}
        />
      );
    }.bind(this));

    return (
      <div>
        <Row>
          <Col sm={4}>
            <label className="control-label">Date</label>
          </Col>
          <Col sm={3}>
            <label className="control-label">Start Time</label>
          </Col>
          <Col sm={3}>
            <label className="control-label">End Time</label>
          </Col>
        </Row>
        {sessionForms}
      </div>
    );
  }
});
module.exports = SessionListFormPart;
