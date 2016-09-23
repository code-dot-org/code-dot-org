/**
 * Workshop management buttons (view, edit, delete).
 */
import React from 'react';
import {Button} from 'react-bootstrap';
import ConfirmationDialog from './confirmation_dialog';

const WorkshopManagement = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  propTypes: {
    workshopId: React.PropTypes.number.isRequired,
    viewUrl: React.PropTypes.string.isRequired,
    editUrl: React.PropTypes.string,
    onDelete: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      editUrl: null,
      onDelete: null
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
    this.props.onDelete(this.props.workshopId);
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

  render() {
    return (
      <div>
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
      </div>
    );
  }
});
export default WorkshopManagement;
