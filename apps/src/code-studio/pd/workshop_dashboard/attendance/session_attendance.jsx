/**
 * Display and edit attendance for a workshop session, for display in a WorkshopAttendance tab.
 */
import React from 'react';
import SessionAttendanceRow from './session_attendance_row';
import {Table} from 'react-bootstrap';

const SessionAttendance = React.createClass({
  propTypes: {
    sessionId: React.PropTypes.number,
    attendance: React.PropTypes.array.isRequired,
    adminOverride: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    isReadOnly: React.PropTypes.bool
  },

  handleChange(i) {
    this.props.onChange(i, !this.props.attendance[i].attended);
  },

  render() {
    const tableRows = this.props.attendance.map((attendanceRow, i) => {
      return (
        <SessionAttendanceRow
          key={i}
          sessionId={this.props.sessionId}
          attendance={attendanceRow}
          adminOverride={this.props.adminOverride}
          onChange={this.handleChange.bind(null,i)}
          isReadOnly={this.props.isReadOnly}
        />
      );
    });
    return (
      <div>
        <Table striped bordered condensed hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enrolled</th>
              <th>Code Studio Account</th>
              <th>Joined Section</th>
              <th>Attended</th>
            </tr>
          </thead>
          <tbody>
          {tableRows}
          </tbody>
        </Table>
      </div>
    );
  }
});
export default SessionAttendance;
