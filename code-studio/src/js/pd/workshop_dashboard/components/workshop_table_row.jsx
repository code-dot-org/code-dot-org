/*
  Workshop summary display for use as a row in WorkshopTable
 */
import React from 'react';
var SessionTimesList = require('./session_times_list');
var ConfirmationDialog = require('./confirmation_dialog');
var FacilitatorsList = require('./facilitators_list');
var Button = require('react-bootstrap').Button;

var WorkshopTableRow = React.createClass({
  propTypes: {
    workshop: React.PropTypes.shape({
      sessions: React.PropTypes.array.isRequired,
      location_name: React.PropTypes.string.isRequired,
      workshop_type: React.PropTypes.string.isRequired,
      course: React.PropTypes.string.isRequired,
      enrolled_teacher_count: React.PropTypes.number.isRequired,
      capacity: React.PropTypes.number.isRequired,
      facilitators: React.PropTypes.array.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired,
    onView: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func,
    onDelete: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      showDeleteConfirmation: false
    };
  },

  handleViewClick: function (e) {
    this.props.onView(this.props.workshop);
  },
  handleEditClick: function (e) {
    this.props.onEdit(this.props.workshop);
  },

  handleDeleteClick: function () {
    this.setState({showDeleteConfirmation: true});
  },

  handleDeleteCanceled: function () {
    this.setState({showDeleteConfirmation: false});
  },

  handleDeleteConfirmed: function () {
    this.setState({showDeleteConfirmation: false});
    this.props.onDelete(this.props.workshop);
  },

  renderEditButton: function () {
    if (!this.props.onEdit) {
      return null;
    }

    return (
      <Button bsSize="xsmall" onClick={this.handleEditClick}>
        Edit
      </Button>
    );
  },

  renderDeleteButton: function () {
    if (!this.props.onDelete) {
      return null;
    }

    return (
      <Button bsSize="xsmall" onClick={this.handleDeleteClick}>
        Delete
      </Button>
    );
  },

  render: function () {
    return (
      <tr>
        <td>
          <SessionTimesList sessions={this.props.workshop.sessions} />
        </td>
        <td>
          {this.props.workshop.location_name}
        </td>
        <td>
          {this.props.workshop.workshop_type}
        </td>
        <td>
          {this.props.workshop.course}
        </td>
        <td>
          {this.props.workshop.enrolled_teacher_count} / {this.props.workshop.capacity}
        </td>
        <td>
          <FacilitatorsList facilitators={this.props.workshop.facilitators} />
        </td>
        <td>
          {this.props.workshop.state}
        </td>
        <td>
          <Button bsSize="xsmall" onClick={this.handleViewClick}>View</Button>
          {this.renderEditButton()}
          {this.renderDeleteButton()}
          <ConfirmationDialog
            show={this.state.showDeleteConfirmation}
            onOk={this.handleDeleteConfirmed}
            onCancel={this.handleDeleteCanceled}
            headerText="Delete Workshop"
            bodyText="Are you sure you want to delete this workshop? Once deleted it can't be recovered."
          />
        </td>
      </tr>
    );
  }
});
module.exports = WorkshopTableRow;
