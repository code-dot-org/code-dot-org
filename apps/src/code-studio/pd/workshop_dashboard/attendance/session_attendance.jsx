/**
 * Display and edit attendance for a workshop session, for display in a WorkshopAttendance tab.
 */
import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import SessionAttendanceRow from './session_attendance_row';
import VisibilitySensor from '../components/visibility_sensor';
import Spinner from '../components/spinner';
import {Table} from 'react-bootstrap';
import IdleTimer from 'react-idle-timer';

// in milliseconds
const REFRESH_DELAY = 5000;
const IDLE_TIMEOUT = 60000;

const styles = {
  idle: {
    opacity: .5
  }
};

const SessionAttendance = React.createClass({
  propTypes: {
    workshopId: React.PropTypes.number.isRequired,
    sessionId: React.PropTypes.number.isRequired,
    adminOverride: React.PropTypes.bool,
    isReadOnly: React.PropTypes.bool,
    onSaving: React.PropTypes.func.isRequired,
    onSaved: React.PropTypes.func.isRequired,
    accountRequiredForAttendance: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      loading: true,
      attendance: undefined,
      refreshInterval: undefined
    };
  },

  componentDidMount() {
    this.load();
    this.startRefreshInterval();
  },

  componentWillUnmount() {
    this.stopRefreshInterval();
  },

  startRefreshInterval() {
    if (!this.state.refreshInterval) {
      const refreshInterval = window.setTimeout(this.load, REFRESH_DELAY);
      this.setState({refreshInterval});
    }
  },

  stopRefreshInterval() {
    if (this.state.refreshInterval) {
      window.clearInterval(this.state.refreshInterval);
      this.abortLoadRequest();
      this.setState({refreshInterval: null});
    }
  },

  abortLoadRequest() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.sessionId !== this.props.sessionId) {
      this.load(nextProps);
      this.startRefreshInterval();
    }
  },

  load(props = null) {
    // Abort any previous load request.
    this.abortLoadRequest();

    if (props) {
      this.setState({
        loading: true,
        attendance: undefined
      });
    } else {
      props = this.props;
    }

    this.loadRequest = $.ajax({
      method: "GET",
      url: `/api/v1/pd/workshops/${props.workshopId}/attendance/${props.sessionId}`,
      dataType: "json"
    }).done(data => {
      this.loadRequest = null;

      this.setState({
        loading: false,
        attendance: _.sortBy(data.attendance, ['last_name', 'first_name'])
      });
    });
  },

  setIdle() {
    this.stopRefreshInterval();
  },

  setActive() {
    this.load();
    this.startRefreshInterval();
  },

  handleAttendanceChangeSaving() {
    this.props.onSaving();
  },

  handleAttendanceChangeSaved(i, value) {
    if (!value.error) {
      const clonedAttendance = _.cloneDeep(this.state.attendance);
      clonedAttendance[i] = value;
      this.setState({
        attendance: clonedAttendance
      });
    }
    this.props.onSaved(value);
  },

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }

    const tableRows = this.state.attendance.map((attendanceRow, i) => {
      return (
        <SessionAttendanceRow
          key={i}
          workshopId={this.props.workshopId}
          sessionId={this.props.sessionId}
          attendance={attendanceRow}
          adminOverride={this.props.adminOverride}
          isReadOnly={this.props.isReadOnly}
          onSaving={this.handleAttendanceChangeSaving}
          onSaved={this.handleAttendanceChangeSaved.bind(this, i)}
          accountRequiredForAttendance={this.props.accountRequiredForAttendance}
        />
      );
    });
    return (
      <VisibilitySensor onHidden={this.setIdle} onVisible={this.setActive}>
        <IdleTimer
          timeout={IDLE_TIMEOUT}
          idleAction={this.setIdle}
          activeAction={this.setActive}
        >
          <Table
            striped
            bordered
            condensed
            hover
            style={this.state.refreshInterval ? null : styles.idle}
          >
            <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              {this.props.accountRequiredForAttendance && <th>Code Studio Account</th>}
              {this.props.accountRequiredForAttendance && <th>Joined Section</th>}
              <th>Attended</th>
            </tr>
            </thead>
            <tbody>
            {tableRows}
            </tbody>
          </Table>
        </IdleTimer>
      </VisibilitySensor>
    );
  }
});
export default SessionAttendance;
