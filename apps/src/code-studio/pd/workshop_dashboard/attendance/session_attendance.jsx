/**
 * Display and edit attendance for a workshop session, for display in a WorkshopAttendance tab.
 */
import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import $ from 'jquery';
import _ from 'lodash';
import SessionAttendanceRow from './session_attendance_row';
import VisibilitySensor from '../components/visibility_sensor';
import Spinner from '../../components/spinner';
import {Table} from 'react-bootstrap';
import IdleTimer from 'react-idle-timer';
import {COURSE_CSF} from '../workshopConstants';
import {
  PermissionPropType,
  WorkshopAdmin,
  Partner
} from '../permission';

// in milliseconds
const REFRESH_DELAY = 5000;
const IDLE_TIMEOUT = 60000;

const styles = {
  idle: {
    opacity: .5
  },
  attendanceSummary: {
    fontFamily: 'Gotham 4r',
    fontSize: 16,
    margin: 15
  }
};

export class SessionAttendance extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
    workshopId: PropTypes.number.isRequired,
    course: PropTypes.string.isRequired,
    sessionId: PropTypes.number.isRequired,
    isReadOnly: PropTypes.bool,
    onSaving: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    accountRequiredForAttendance: PropTypes.bool.isRequired,
    enrollmentCount: PropTypes.number.isRequired
  };

  state = {
    loading: true,
    attendance: undefined,
    refreshInterval: undefined
  };

  componentDidMount() {
    this.load();
    this.startRefreshInterval();
    this.isCSF = this.props.course === COURSE_CSF;
    this.showPuzzlesCompleted = this.isCSF;
  }

  componentWillUnmount() {
    this.stopRefreshInterval();
  }

  startRefreshInterval() {
    if (!this.state.refreshInterval) {
      const refreshInterval = window.setInterval(this.load, REFRESH_DELAY);
      this.setState({refreshInterval});
    }
  }

  stopRefreshInterval() {
    if (this.state.refreshInterval) {
      window.clearInterval(this.state.refreshInterval);
      this.abortLoadRequest();
      this.setState({refreshInterval: null});
    }
  }

  abortLoadRequest() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sessionId !== this.props.sessionId) {
      this.load(nextProps);
      this.startRefreshInterval();
    }
  }

  load = (props = null) => {
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
  };

  setIdle = () => {
    this.stopRefreshInterval();
  };

  setActive = () => {
    this.load();
    this.startRefreshInterval();
  };

  handleAttendanceChangeSaving = () => {
    this.props.onSaving();
  };

  handleAttendanceChangeSaved = (i, value) => {
    if (!value.error) {
      const clonedAttendance = _.cloneDeep(this.state.attendance);
      clonedAttendance[i] = value;
      this.setState({
        attendance: clonedAttendance
      });
    }
    this.props.onSaved(value);
  };

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
          isReadOnly={this.props.isReadOnly}
          onSaving={this.handleAttendanceChangeSaving}
          onSaved={this.handleAttendanceChangeSaved.bind(this, i)}
          accountRequiredForAttendance={this.props.accountRequiredForAttendance}
          showPuzzlesCompleted={this.showPuzzlesCompleted}
          displayYesNoAttendance={!this.props.permission.hasAny(WorkshopAdmin, Partner)}
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
          <div>
            <div style={styles.attendanceSummary}>
              Attendance: {this.state.attendance.length} / {this.props.enrollmentCount}
            </div>

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
                <th>Verified Teacher Account</th>
                {this.showPuzzlesCompleted &&
                <th>Puzzles Completed</th>
                }
                {this.isCSF ?
                  <th>Attended</th>
                  :
                  <th>Present</th>
                }
              </tr>
              </thead>
              <tbody>
              {tableRows}
              </tbody>
            </Table>
          </div>
        </IdleTimer>
      </VisibilitySensor>
    );
  }
}

export default connect(state => ({
  permission: state.permission
}))(SessionAttendance);
