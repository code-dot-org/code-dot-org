import React from 'react';
import { connect } from 'react-redux';
import { closeDialog } from '../../redux/instructions';

/**
 * A component for managing our instructions dialog. Right now the entirety of
 * the actual content is managed by showInstructionsDialog rather than this
 * component, with this component just determining when we should show the
 * dialog (based on redux state).
 * Long term we could start moving some/all of the logic in showInstructionsDialog
 * into this component, though we're moving towards getting rid of this dialog
 * anyways.
 */
const InstructionsDialogWrapper = React.createClass({
  componentWillReceiveProps(nextProps) {
    if (!this.props.isOpen && nextProps.isOpen) {
      this.props.showInstructionsDialog(nextProps.autoClose, nextProps.showHints);
    }
  },

  render() {
    return null;
  }
});

InstructionsDialogWrapper.props = {
  isOpen: React.PropTypes.bool.isRequired,
  autoClose: React.PropTypes.bool,
  showHints: React.PropTypes.bool,
  showInstructionsDialog: React.PropTypes.func.isRequired
};

export default connect(state => ({
  isOpen: state.instructionsDialog.open,
  autoClose: state.instructionsDialog.autoClose,
  showHints: state.instructionsDialog.showHints,
}), dispatch => ({
  closeDialog() {
    dispatch(closeDialog());
  }
}))(InstructionsDialogWrapper);
