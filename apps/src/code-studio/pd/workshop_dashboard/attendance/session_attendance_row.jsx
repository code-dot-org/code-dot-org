/**
 * Display and edit attendance for a single teacher in a session,
 * for use in SessionAttendance.
 */
import React from "react";
import $ from 'jquery';
import {OverlayTrigger, Tooltip} from "react-bootstrap";

const styles = {
  contents: {
    height: '100%',
    width: '100%',
    cursor:'pointer'
  }
};

const SessionAttendanceRow = React.createClass({
  propTypes: {
    workshopId: React.PropTypes.number.isRequired,
    sessionId: React.PropTypes.number.isRequired,
    attendance: React.PropTypes.shape({
      first_name: React.PropTypes.string.isRequired,
      last_name: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      enrollment_id: React.PropTypes.number.isRequired,
      user_id: React.PropTypes.number,
      in_section: React.PropTypes.bool.isRequired,
      attended: React.PropTypes.bool.isRequired,
      puzzles_completed: React.PropTypes.number.isRequired
    }).isRequired,
    adminOverride: React.PropTypes.bool,
    isReadOnly: React.PropTypes.bool,
    onSaving: React.PropTypes.func.isRequired,
    onSaved: React.PropTypes.func.isRequired,
    accountRequiredForAttendance: React.PropTypes.bool.isRequired,
    sectionRequiredForAttendance: React.PropTypes.bool.isRequired,
    showSectionMembership: React.PropTypes.bool.isRequired,
    showPuzzlesCompleted: React.PropTypes.bool.isRequired,
    displayYesNoAttendance: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      pendingRequest: null
    };
  },

  componentWillUnmount() {
    if (this.state.pendingRequest) {
      this.state.pendingRequest.abort();
    }
  },

  isValid() {
    if (!this.props.accountRequiredForAttendance) {
      return true;
    }

    if (!this.props.sectionRequiredForAttendance && this.props.attendance.user_id) {
      return true;
    }

    // Must have an account, and either have joined the section or
    // be overridden by an admin (which will join the section on the backend).
    return this.props.attendance.user_id && (this.props.attendance.in_section || this.props.adminOverride);
  },

  handleClickAttended() {
    if (this.isValid()) {
      if (this.props.attendance.attended) {
        this.deleteAttendance();
      } else {
        this.setAttendance();
      }
    }
  },

  getApiUrl() {
    const {workshopId, sessionId} = this.props;

    if (this.props.accountRequiredForAttendance) {
      const userId = this.props.attendance.user_id;
      return `/api/v1/pd/workshops/${workshopId}/attendance/${sessionId}/user/${userId}`;
    } else {
      const enrollmentId = this.props.attendance.enrollment_id;
      return `/api/v1/pd/workshops/${workshopId}/attendance/${sessionId}/enrollment/${enrollmentId}`;
    }
  },

  setAttendance() {
    let url = this.getApiUrl();
    if (this.props.adminOverride) {
      url += '?admin_override=1';
    }

    this.save(
      'PUT',
      url,
      {
        in_section: this.props.accountRequiredForAttendance,
        attended: true
      }
    );
  },

  deleteAttendance() {
    this.save(
      'DELETE',
      this.getApiUrl(),
      {
        attended: false
      }
    );
  },

  // Saves via the specified method and url, merging in the newAttendanceValues on success.
  save(method, url, newAttendanceValues) {
    const pendingRequest = $.ajax({
      method,
      url,
      dataType: "json"
    }).done(() => {
      // Clone attendance, merge the new values, and send upstream.
      this.props.onSaved({
        ...this.props.attendance,
        ...newAttendanceValues
      });
    }).fail(() => {
      // Tell the parent we failed to save.
      this.props.onSaved({
        error: true
      });
    }).always(() => {
      this.setState({pendingRequest: null});
    });

    // Tell the parent we are saving.
    this.setState({pendingRequest});
    this.props.onSaving();
  },

  renderAttendedCellContents() {
    if (this.props.displayYesNoAttendance) {
      return this.props.attendance.attended ? 'Yes' : 'No';
    } else {
      return this.renderEditableAttendedCellContents();
    }
  },

  renderEditableAttendedCellContents() {
    const checkBoxClass = this.props.attendance.attended ? "fa fa-check-square-o" : "fa fa-square-o";
    if (this.props.isReadOnly || this.state.pendingRequest) {
      return (
        <div>
          <i className={checkBoxClass}/>
        </div>
      );
    }

    const contents = (
      <div style={styles.contents} onClick={this.handleClickAttended}>
        <i className={checkBoxClass}/>
      </div>
    );

    if (!this.isValid()) {
      let message;
      if (this.props.adminOverride) {
        message = 'Even in admin override mode, the teacher must have a Code Studio account.';
      } else if (this.props.sectionRequiredForAttendance) {
        message = 'Teachers must have a Code Studio account and join the section before they can be marked attended.';
      } else {
        message = 'Teachers must have a Code Studio account before they can be marked attended.';
      }
      const tooltip = (
        <Tooltip id={0}>
          {message}
        </Tooltip>
      );
      return (
        <OverlayTrigger overlay={tooltip} placement="left" delayShow={100}>
          {contents}
        </OverlayTrigger>
      );
    }

    return contents;
  },

  render: function () {
    return (
      <tr className={this.props.attendance.attended ? 'success' : null}>
        <td>
          {this.props.attendance.first_name}
        </td>
        <td>
          {this.props.attendance.last_name}
        </td>
        <td>
          {this.props.attendance.email}
        </td>
        {
          this.props.accountRequiredForAttendance &&
          <td>
            {this.props.attendance.user_id ? "Yes" : "No"}
          </td>
        }
        {
          this.props.accountRequiredForAttendance && this.props.showSectionMembership &&
          <td>
            {this.props.attendance.in_section ? "Yes" : "No"}
          </td>
        }
        {
          this.props.showPuzzlesCompleted &&
          <td>
            {this.props.attendance.puzzles_completed}
          </td>
        }
        <td>
          {this.renderAttendedCellContents()}
        </td>
      </tr>
    );
  }
});
export default SessionAttendanceRow;
