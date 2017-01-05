/** @file controls below a dialog to delete animations */
import React from 'react';
import Radium from 'radium';
import BaseDialog from '../../templates/BaseDialog';

const DeleteAnimationDialog = React.createClass({
  propTypes: {
    onDelete: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    isOpen: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <div>
        <BaseDialog
          isOpen={this.props.isOpen}
          handleClose={this.props.onCancel}
        >
          <h1>Delete animation</h1>
          <p style={{color: "black"}}>Are you sure you want to delete this animation? You cannot undo this action.</p>
          <button onClick={this.props.onCancel}>Cancel</button>
          <button onClick={this.props.onDelete}>Delete</button>
        </BaseDialog>
      </div>
    );
  }
});
export default Radium(DeleteAnimationDialog);
