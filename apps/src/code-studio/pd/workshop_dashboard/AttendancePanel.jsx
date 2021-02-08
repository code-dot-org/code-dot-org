import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {Row, Col, Button} from 'react-bootstrap';
import WorkshopPanel from './WorkshopPanel';
import {DATE_FORMAT} from './workshopConstants';

/**
 * Provides controls for taking attendance in a workshop session.
 */
export default class AttendancePanel extends React.Component {
  static propTypes = {
    workshopId: PropTypes.string,
    sessions: PropTypes.array
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  getSessionAttendanceLink(session) {
    const url = this.getSessionAttendanceUrl(session);
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
    );
  }

  getSessionAttendanceUrl(session) {
    if (!session.code) {
      console.warn(`No attendance code found for session ${session.id}`);
      return null;
    }

    return `${window.location.protocol}${window.dashboard.CODE_ORG_URL}/pd/${
      session.code
    }`;
  }

  getAttendanceUrl(sessionId) {
    return `/workshops/${this.props.workshopId}/attendance/${sessionId}`;
  }

  handleTakeAttendanceClick = event => {
    event.preventDefault();
    const sessionId = event.currentTarget.dataset.session_id;
    this.context.router.push(this.getAttendanceUrl(sessionId));
  };

  render() {
    const {sessions} = this.props;
    return (
      <WorkshopPanel header="Take Attendance:">
        <div>
          <p>
            There is a unique attendance URL for each day of your workshop. On
            each day of your workshop, your participants must visit that day's
            attendance URL to receive professional development credit. The
            attendance URL(s) will be shown below, 2 days in advance, for your
            convenience.
          </p>
          <Row>
            <Col md={2}>Date</Col>
            <Col md={4}>Attendance URL</Col>
            <Col md={4}>View Daily Roster</Col>
          </Row>
          {sessions.map(session => {
            const date = moment.utc(session.start).format(DATE_FORMAT);
            return (
              <Row key={session.id} style={styles.attendanceRow}>
                <Col md={2}>
                  <div style={styles.attendanceRowText}>{date}</div>
                </Col>
                <Col md={4}>
                  {session['show_link?'] && (
                    <div style={styles.attendanceRowText}>
                      {this.getSessionAttendanceLink(session)}
                    </div>
                  )}
                </Col>
                <Col md={4}>
                  <Button
                    className={
                      session['show_link?'] && session.attendance_count === 0
                        ? 'btn-orange'
                        : null
                    }
                    data-session_id={session.id}
                    href={this.context.router.createHref(
                      this.getAttendanceUrl(session.id)
                    )}
                    onClick={this.handleTakeAttendanceClick}
                  >
                    Attendance for&nbsp;
                    {date}
                  </Button>
                </Col>
              </Row>
            );
          })}
        </div>
      </WorkshopPanel>
    );
  }
}

const styles = {
  attendanceRow: {
    padding: '5px 0'
  },
  attendanceRowText: {
    fontSize: '14px',
    padding: '6px 0',
    margin: 1
  }
};
