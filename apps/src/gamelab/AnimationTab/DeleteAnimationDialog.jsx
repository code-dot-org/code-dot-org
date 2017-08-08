/** @file controls below a dialog to delete animations */
import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import Dialog, {Body, Buttons, Cancel, Confirm} from '../../templates/Dialog';

const DeleteAnimationDialog = createReactClass({
  propTypes: {
    onDelete: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Dialog
        isOpen={this.props.isOpen}
        handleClose={this.props.onCancel}
        title="Delete animation"
      >
        <Body>
          <div>Are you sure you want to delete this animation? You cannot undo this action.</div>
        </Body>
        <Buttons>
          <Cancel onClick={this.props.onCancel}>Cancel</Cancel>
          <Confirm onClick={this.props.onDelete} type="danger">Delete</Confirm>
        </Buttons>
      </Dialog>
    );
  }
});
export default DeleteAnimationDialog;
