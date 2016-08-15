/**
 * Workshop summary display for use as a row in WorkshopTable
 */
import React from 'react';
import {Button} from 'react-bootstrap';
import SessionTimesList from './session_times_list';
import ConfirmationDialog from './confirmation_dialog';
import FacilitatorsList from './facilitators_list';

const WorkshopTableRow = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    workshop: React.PropTypes.shape({
      id: React.PropTypes.number.isRequired,
      sessions: React.PropTypes.array.isRequired,
      location_name: React.PropTypes.string.isRequired,
      workshop_type: React.PropTypes.string.isRequired,
      course: React.PropTypes.string.isRequired,
      enrolled_teacher_count: React.PropTypes.number.isRequired,
      capacity: React.PropTypes.number.isRequired,
      facilitators: React.PropTypes.array.isRequired,
      state: React.PropTypes.string.isRequired
    }).isRequired,
    viewUrl: React.PropTypes.string.isRequired,
    editUrl: React.PropTypes.string,
    onDelete: React.PropTypes.func,
    showSignupUrl: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      onEdit: null,
      onDelete: null,
      showSignupUrl: false
    };
  },

  getInitialState() {
    return {
      showDeleteConfirmation: false
    };
  },

  handleViewClick(event) {
    event.preventDefault();
    this.context.router.push(this.props.viewUrl);
  },

  handleEditClick(event) {
    event.preventDefault();
    this.context.router.push(this.props.editUrl);
  },

  handleDeleteClick() {
    this.setState({showDeleteConfirmation: true});
  },

  handleDeleteCanceled() {
    this.setState({showDeleteConfirmation: false});
  },

  handleDeleteConfirmed() {
    this.setState({showDeleteConfirmation: false});
    this.props.onDelete(this.props.workshop);
  },

  renderViewButton() {
    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.viewUrl)}
        onClick={this.handleViewClick}
      >
        View
      </Button>
    );
  },

  renderEditButton() {
    if (!this.props.editUrl) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(this.props.editUrl)}
        onClick={this.handleEditClick}
      >
        Edit
      </Button>
    );
  },

  renderDeleteButton() {
    if (!this.props.onDelete) {
      return null;
    }

    return (
      <Button bsSize="xsmall" onClick={this.handleDeleteClick}>
        Delete
      </Button>
    );
  },

  renderSignupUrlCell() {
    if (!this.props.showSignupUrl) {
      return null;
    }

    const signupUrl = `${location.origin}/pd/workshops/${this.props.workshop.id}/enroll`;
    return (
      <td>
        <a href={signupUrl} target="_blank">
          {signupUrl}
        </a>
      </td>
    );
  },

  render() {
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
        {this.renderSignupUrlCell()}
        <td>
          {this.renderViewButton()}
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
