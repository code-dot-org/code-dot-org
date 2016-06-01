/*
  Display and edit attendance for a single teacher in a session,
  for use in SessionAttendance.
 */
import React from 'react';
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;
var Tooltip = require('react-bootstrap').Tooltip;

var styles = {
  contents: {
    height: '100%',
    width: '100%',
    cursor:'pointer'
  }
};

var SessionAttendanceRow = React.createClass({
  propTypes: {
    sessionId: React.PropTypes.number,
    attendance: React.PropTypes.shape({
      name: React.PropTypes.string.isRequired,
      email: React.PropTypes.string.isRequired,
      enrolled: React.PropTypes.bool.isRequired,
      user_id: React.PropTypes.number,
      in_section: React.PropTypes.bool.isRequired,
      attended: React.PropTypes.bool.isRequired
    }).isRequired,
    adminOverride: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
    isReadOnly: React.PropTypes.bool
  },

  isValid: function () {
    // Must have an account and have joined the section before being marked attended,
    // unless overridden by an admin.
    return (this.props.attendance.user_id && this.props.attendance.in_section) || this.props.adminOverride;
  },

  handleClickAttended: function () {
    if (this.isValid()) {
      this.props.onChange();
    }
  },

  renderAttendedCellContents: function () {
    var checkBoxClass = this.props.attendance.attended ? "fa fa-check-square-o" : "fa fa-square-o";
    if (this.props.isReadOnly) {
      return (
        <div>
          <i className={checkBoxClass}/>
        </div>
      );
    }

    var contents = (
      <div style={styles.contents} onClick={this.handleClickAttended}>
        <i className={checkBoxClass}/>
      </div>
    );

    if (!this.isValid()) {
      var tooltip = (
        <Tooltip id={0}>
          Teachers must have a Code Studio account and join the section before they can be marked attended.
        </Tooltip>
      );
      return (
        <OverlayTrigger overlay={tooltip} placement="left" delayShow={500}>
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
          {this.props.attendance.name}
        </td>
        <td>
          {this.props.attendance.email}
        </td>
        <td>
          {this.props.attendance.enrolled ? "Yes" : "No"}
        </td>
        <td>
          {this.props.attendance.user_id ? "Yes" : "No"}
        </td>
        <td>
          {this.props.attendance.in_section ? "Yes" : "No"}
        </td>
        <td>
          {this.renderAttendedCellContents()}
        </td>
      </tr>
    );
  }
});
module.exports = SessionAttendanceRow;
