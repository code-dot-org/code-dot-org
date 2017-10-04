/**
 * Dynamic list of session inputs for creating and editing workshops.
 */
import React, {PropTypes} from 'react';
import moment from 'moment';
import {Row, Col} from 'react-bootstrap';
import SessionFormPart from './session_form_part';
import {DATE_FORMAT, MAX_SESSIONS} from '../workshopConstants';

export default class SessionListFormPart extends React.Component {
  static propTypes = {
    sessions: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    shouldValidate: PropTypes.bool,
    readOnly: PropTypes.bool
  };

  nextPlaceholderId = 1;

  handleChange = (i, session) => {
    this.props.sessions[i] = session;
    this.props.onChange(this.props.sessions);
  };

  handleAdd = () => {
    const sessions = this.props.sessions;
    const lastSession = sessions[sessions.length - 1];
    const newSession = {
      // Placeholder Ids are needed to generate unique keys in the React list.
      // Prefix with _ so they don't conflict with actual Ids on sessions that have been saved.
      placeholderId: '_' + (this.nextPlaceholderId++),
      date: moment(lastSession.date, DATE_FORMAT).add(1,'days').format(DATE_FORMAT),
      startTime: lastSession.startTime,
      endTime: lastSession.endTime
    };

    sessions.push(newSession);
    this.props.onChange(sessions);
  };

  handleRemove = (i) => {
    const sessions = this.props.sessions;
    const removedSession = sessions.splice(i, 1)[0];
    this.props.onChange(sessions, removedSession);
  };

  render() {
    const sessionForms = this.props.sessions.map((session, i, sessions) => {
      const handleAdd = i === sessions.length-1 && sessions.length < MAX_SESSIONS ? this.handleAdd : null;
      const handleRemove = sessions.length > 1 ? this.handleRemove.bind(null, i) : null;
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
    });

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
}
