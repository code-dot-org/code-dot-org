/**
 * Display and edit attendance for a single teacher in a session,
 * for use in SessionAttendance.
 */
import PropTypes from 'prop-types';

import React from 'react';
import $ from 'jquery';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

export default class SessionAttendanceRow extends React.Component {
  static propTypes = {
    workshopId: PropTypes.number.isRequired,
    sessionId: PropTypes.number.isRequired,
    attendance: PropTypes.shape({
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      enrollment_id: PropTypes.number.isRequired,
      user_id: PropTypes.number,
      verified_teacher_account: PropTypes.bool.isRequired,
      attended: PropTypes.bool.isRequired,
      cdo_scholarship: PropTypes.bool,
      other_scholarship: PropTypes.bool
    }).isRequired,
    adminOverride: PropTypes.bool,
    isReadOnly: PropTypes.bool,
    onSaving: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    accountRequiredForAttendance: PropTypes.bool.isRequired,
    scholarshipWorkshop: PropTypes.bool.isRequired,
    displayYesNoAttendance: PropTypes.bool.isRequired
  };

  state = {
    pendingRequest: null
  };

  componentWillUnmount() {
    if (this.state.pendingRequest) {
      this.state.pendingRequest.abort();
    }
  }

  isValid() {
    return (
      !this.props.accountRequiredForAttendance || this.props.attendance.user_id
    );
  }

  handleClickAttended = () => {
    if (this.isValid()) {
      if (this.props.attendance.attended) {
        this.deleteAttendance();
      } else {
        this.setAttendance();
      }
    }
  };

  getApiUrl() {
    const {workshopId, sessionId} = this.props;

    if (this.props.accountRequiredForAttendance) {
      const userId = this.props.attendance.user_id;
      return `/api/v1/pd/workshops/${workshopId}/attendance/${sessionId}/user/${userId}`;
    } else {
      const enrollmentId = this.props.attendance.enrollment_id;
      return `/api/v1/pd/workshops/${workshopId}/attendance/${sessionId}/enrollment/${enrollmentId}`;
    }
  }

  setAttendance() {
    let url = this.getApiUrl();
    if (this.props.adminOverride) {
      url += '?admin_override=1';
    }

    this.save('PUT', url, {
      attended: true
    });
  }

  deleteAttendance() {
    this.save('DELETE', this.getApiUrl(), {
      attended: false
    });
  }

  // Saves via the specified method and url, merging in the newAttendanceValues on success.
  save(method, url, newAttendanceValues) {
    const pendingRequest = $.ajax({
      method,
      url,
      dataType: 'json'
    })
      .done(() => {
        // Clone attendance, merge the new values, and send upstream.
        this.props.onSaved({
          ...this.props.attendance,
          ...newAttendanceValues
        });
      })
      .fail(() => {
        // Tell the parent we failed to save.
        this.props.onSaved({
          error: true
        });
      })
      .always(() => {
        this.setState({pendingRequest: null});
      });

    // Tell the parent we are saving.
    this.setState({pendingRequest});
    this.props.onSaving();
  }

  renderAttendedCellContents() {
    if (this.props.displayYesNoAttendance) {
      return this.props.attendance.attended ? 'Yes' : 'No';
    } else {
      return this.renderEditableAttendedCellContents();
    }
  }

  renderEditableAttendedCellContents() {
    const checkBoxClass = this.props.attendance.attended
      ? 'fa fa-check-square-o'
      : 'fa fa-square-o';
    if (this.props.isReadOnly || this.state.pendingRequest) {
      return (
        <div>
          <i className={checkBoxClass} />
        </div>
      );
    }

    const contents = (
      <div style={styles.contents} onClick={this.handleClickAttended}>
        <i className={checkBoxClass} />
      </div>
    );

    if (!this.isValid()) {
      const tooltip = (
        <Tooltip id={0}>
          Teachers must have a Code Studio account before they can be marked
          attended.
        </Tooltip>
      );
      return (
        <OverlayTrigger overlay={tooltip} placement="left" delayShow={100}>
          {contents}
        </OverlayTrigger>
      );
    }

    return contents;
  }

  render() {
    return (
      <tr className={this.props.attendance.attended ? 'success' : null}>
        <td>{this.props.attendance.first_name}</td>
        <td>{this.props.attendance.last_name}</td>
        <td>{this.props.attendance.email}</td>
        <td>{this.props.attendance.verified_teacher_account ? 'Yes' : 'No'}</td>
        {this.props.scholarshipWorkshop && (
          <td>{this.props.attendance.cdo_scholarship ? 'Yes' : ''}</td>
        )}
        {this.props.scholarshipWorkshop && (
          <td>{this.props.attendance.other_scholarship ? 'Yes' : ''}</td>
        )}
        <td>{this.renderAttendedCellContents()}</td>
      </tr>
    );
  }
}

const styles = {
  contents: {
    height: '100%',
    width: '100%',
    cursor: 'pointer'
  }
};
